import os
import re
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Optional
import requests
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from pytesseract import image_to_string
from PIL import Image
import yt_dlp


def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|v/|embed/|youtu\.be/)([A-Za-z0-9_-]{11})",
        r"^([A-Za-z0-9_-]{11})$",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    raise ValueError(f"Could not extract video ID from: {url}")


def fetch_metadata(video_id: str) -> dict:
    oembed_url = (
        "https://www.youtube.com/oembed"
        f"?url=https://www.youtube.com/watch?v={video_id}&format=json"
    )
    try:
        r = requests.get(oembed_url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code == 200:
            data = r.json()
            return {
                "title": data.get("title", ""),
                "channel": data.get("author_name", ""),
                "channel_url": data.get("author_url", ""),
                "thumbnail_url": data.get("thumbnail_url", ""),
            }
    except Exception:
        pass
    return {}


def fetch_transcript(video_id: str) -> dict:
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = None
        for lang in ["en", "en-US", "en-GB", "a.en"]:
            try:
                transcript = transcript_list.find_transcript([lang])
                break
            except Exception:
                continue
        if transcript is None:
            transcript = transcript_list.find_a_transcript(
                ["en", "en-US", "en-GB", "a.en"]
            )
        segments = transcript.fetch()
        return {
            "available": True,
            "language": transcript.language_code,
            "segments": [
                {
                    "start": seg.start,
                    "duration": seg.duration,
                    "text": seg.text.replace("\n", " ").strip(),
                }
                for seg in segments if seg.text.strip()
            ],
        }
    except (TranscriptsDisabled, NoTranscriptFound):
        return {"available": False, "language": None, "segments": []}
    except Exception:
        return {"available": False, "language": None, "segments": []}


def extract_frames_ffmpeg(video_path: str, output_dir: str, interval: int = 10) -> list:
    """Extract frames at fixed intervals using ffmpeg."""
    pattern = os.path.join(output_dir, "frame_%04d.jpg")
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", f"fps=1/{interval}",
        "-q:v", "2",
        pattern,
        "-y"
    ]
    subprocess.run(cmd, capture_output=True, text=True)
    frames = sorted(Path(output_dir).glob("frame_*.jpg"))
    return [str(f) for f in frames]


def ocr_frames(frame_paths: list) -> list:
    results = []
    for path in frame_paths:
        try:
            img = Image.open(path)
            text = image_to_string(img).strip()
            if text:
                results.append({"frame": path, "ocr_text": text})
        except Exception:
            continue
    return results


def analyze_scene_changes(video_path: str) -> list:
    """Detect scene changes using ffmpeg select filter."""
    try:
        cmd = [
            "ffmpeg", "-i", video_path,
            "-vf", "select='gt(scene,0.3)',showinfo",
            "-f", "null", "-"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        timestamps = []
        for line in result.stderr.splitlines():
            if "showinfo" in line and "pts_time:" in line:
                match = re.search(r"pts_time:(\d+\.\d+)", line)
                if match:
                    timestamps.append(float(match.group(1)))
        return sorted(set(timestamps))
    except Exception:
        return []


def analyze_hook(video_path: str, first_seconds: int = 30) -> dict:
    """Extract frames from first N seconds and OCR for hook analysis."""
    tmpdir = tempfile.mkdtemp(prefix="hook_")
    pattern = os.path.join(tmpdir, "hook_%04d.jpg")
    cmd = [
        "ffmpeg", "-i", video_path,
        "-t", str(first_seconds),
        "-vf", "fps=2",
        "-q:v", "2",
        pattern,
        "-y"
    ]
    subprocess.run(cmd, capture_output=True, text=True)
    frames = sorted(Path(tmpdir).glob("hook_*.jpg"))
    ocr_results = []
    for f in frames[:20]:  # limit to first 20 frames
        try:
            text = image_to_string(Image.open(f)).strip()
            if text:
                ocr_results.append(text)
        except Exception:
            continue
    return {
        "first_seconds": first_seconds,
        "frames_analyzed": len(ocr_results),
        "visual_text": ocr_results[:10],
        "has_text_overlay": any(len(t) > 10 for t in ocr_results),
        "has_on_screen_text": len(ocr_results) > 0,
    }


def download_video(url: str) -> dict:
    """Download video with yt-dlp, return path and metadata."""
    tmpdir = tempfile.mkdtemp(prefix="yt_")
    ydl_opts = {
        "outtmpl": os.path.join(tmpdir, "%(id)s.%(ext)s"),
        "format": "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_path = ydl.prepare_filename(info)
        return {
            "video_path": video_path,
            "duration": info.get("duration"),
            "width": info.get("width"),
            "height": info.get("height"),
            "fps": info.get("fps"),
            "tmpdir": tmpdir,
        }


def fetch_top_comments(video_id: str, limit: int = 20) -> list:
    try:
        url = f"https://www.youtube.com/watch?v={video_id}"
        page = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(page.text, "html.parser")
        comments = []
        for item in soup.select("ytd-comment-thread-renderer")[:limit]:
            text_el = item.select_one("#comment-text")
            if text_el:
                comments.append(text_el.get_text(strip=True))
        return comments
    except Exception:
        return []


def analyze_comments(comments: list) -> dict:
    if not comments:
        return {"count": 0, "sentiment": "neutral", "questions": [], "engagement_signals": []}
    
    questions = [c for c in comments if "?" in c and len(c) < 200]
    positive_signals = [c for c in comments if any(w in c.lower() for w in ["thanks", "great", "amazing", "helpful", "learned", "love"])]
    questions_list = [c[:150] for c in questions[:10]]
    engagement_list = [c[:150] for c in positive_signals[:10]]
    
    return {
        "count": len(comments),
        "questions_count": len(questions),
        "top_questions": questions_list,
        "engagement_signals": engagement_list,
    }


def extract_video_analysis(url: str) -> dict:
    video_id = extract_video_id(url)
    metadata = fetch_metadata(video_id)
    
    # Download video for frame analysis
    video_info = download_video(url)
    video_path = video_info["video_path"]
    tmpdir = video_info["tmpdir"]
    
    # Get transcript
    transcript_data = fetch_transcript(video_id)
    transcript_text = " ".join([s["text"] for s in transcript_data.get("segments", [])])
    
    # Extract frames
    frames_dir = os.path.join(tmpdir, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    frame_paths = extract_frames_ffmpeg(video_path, frames_dir, interval=10)
    
    # OCR frames
    ocr_results = ocr_frames(frame_paths[:50])  # limit to 50 frames
    visual_text_chunks = [r["ocr_text"] for r in ocr_results if len(r["ocr_text"]) > 5]
    
    # Scene changes
    scene_changes = analyze_scene_changes(video_path)
    
    # Hook analysis
    hook_analysis = analyze_hook(video_path, first_seconds=30)
    
    # Comments
    comments = fetch_top_comments(video_id, limit=20)
    comment_analysis = analyze_comments(comments)
    
    # Build structure analysis
    sections = []
    if scene_changes and transcript_data.get("segments"):
        segments = transcript_data["segments"]
        current_section = {"start": 0, "end": scene_changes[0], "type": "intro"}
        for t in scene_changes:
            current_section["end"] = t
            sections.append(current_section)
            current_section = {"start": t, "end": t + 10, "type": "content"}
        if segments:
            last_seg = segments[-1]["start"]
            current_section["end"] = last_seg
            sections.append(current_section)
    
    # Cleanup
    try:
        subprocess.run(["rm", "-rf", tmpdir], capture_output=True)
    except Exception:
        pass
    
    return {
        "video_id": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "title": metadata.get("title", ""),
        "channel": metadata.get("channel", ""),
        "duration": video_info.get("duration"),
        "transcript_available": transcript_data["available"],
        "transcript_language": transcript_data.get("language"),
        "transcript_segments": len(transcript_data.get("segments", [])),
        "transcript_preview": transcript_text[:2000] if transcript_text else "",
        "visual_analysis": {
            "frames_analyzed": len(ocr_results),
            "frames_with_text": len(visual_text_chunks),
            "sample_ocr_chunks": visual_text_chunks[:15],
            "scene_changes": [round(t, 1) for t in scene_changes[:20]],
            "hook_analysis": hook_analysis,
        },
        "structure_analysis": {
            "sections_count": len(sections),
            "sections": sections[:10],
        },
        "engagement": {
            "comments_analyzed": comment_analysis["count"],
            "top_questions": comment_analysis.get("top_questions", [])[:5],
            "engagement_signals": comment_analysis.get("engagement_signals", [])[:5],
        },
        "recommended_for_notes": (
            transcript_data["available"] and 
            (len(visual_text_chunks) > 0 or len(comments) > 0)
        ),
    }
