import React, { useState } from 'react';
import { FileText, Globe, File, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type CitationSource = {
  id: number;
  document_id?: number;
  filename: string;
  source_type: string;
  page?: number;
  section?: string;
  line_start?: number;
  line_end?: number;
  paragraph_start?: number;
  paragraph_end?: number;
  url?: string;
  snippet?: string;
  relevance_score?: number;
};

interface SourceCitationProps {
  sources: CitationSource[];
  className?: string;
}

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case 'pdf':
      return <FileText className="w-3.5 h-3.5 text-red-500" />;
    case 'docx':
      return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    case 'text':
      return <File className="w-3.5 h-3.5 text-slate-500" />;
    case 'web':
      return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
    default:
      return <File className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function getSourceLocation(source: CitationSource): string {
  const parts: string[] = [];

  if (source.source_type === 'pdf' && source.page) {
    parts.push(`Page ${source.page}`);
  } else if (source.source_type === 'docx') {
    if (source.section) parts.push(source.section);
    if (source.paragraph_start) {
      parts.push(`¶${source.paragraph_start}${source.paragraph_end && source.paragraph_end !== source.paragraph_start ? `–${source.paragraph_end}` : ''}`);
    }
  } else if (source.source_type === 'text') {
    if (source.line_start) {
      parts.push(`Lines ${source.line_start}${source.line_end && source.line_end !== source.line_start ? `–${source.line_end}` : ''}`);
    }
  }

  return parts.join(', ');
}

export function SourceCitation({ sources, className }: SourceCitationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const docSources = sources.filter(s => s.source_type !== 'web');
  const webSources = sources.filter(s => s.source_type === 'web');

  return (
    <div className={cn("mt-2 border-t border-fog-border pt-2", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-slate-ink hover:text-midnight-navy transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        <span className="font-medium">
          {sources.length} source{sources.length !== 1 ? 's' : ''}
        </span>
        {!isExpanded && (
          <span className="text-slate-ink/60">
            — {docSources.length} doc{docSources.length !== 1 ? 's' : ''}
            {webSources.length > 0 && `, ${webSources.length} web`}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1.5">
          {docSources.length > 0 && (
            <div className="space-y-1">
              {docSources.map((source) => {
                const location = getSourceLocation(source);
                return (
                  <div
                    key={`doc-${source.id}`}
                    className="flex items-start gap-2 text-xs py-1 px-2 rounded bg-ghost-canvas/50"
                  >
                    <span className="font-mono text-slate-ink mt-0.5">[{source.id}]</span>
                    {getSourceIcon(source.source_type)}
                    <div className="flex-1 min-w-0">
                      <span className="text-midnight-navy font-medium truncate block">
                        {source.filename}
                      </span>
                      {location && (
                        <span className="text-slate-ink text-[11px]">{location}</span>
                      )}
                    </div>
                    {source.relevance_score != null && (
                      <span className="text-slate-ink/50 text-[10px] mt-0.5 flex-shrink-0">
                        {Math.round(source.relevance_score * 100)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {webSources.length > 0 && (
            <div className="space-y-1">
              {webSources.map((source) => (
                <a
                  key={`web-${source.id}`}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-xs py-1 px-2 rounded bg-ghost-canvas/50 hover:bg-ghost-canvas transition-colors group"
                >
                  <span className="font-mono text-slate-ink mt-0.5">[{source.id}]</span>
                  {getSourceIcon('web')}
                  <div className="flex-1 min-w-0">
                    <span className="text-midnight-navy font-medium truncate block group-hover:underline">
                      {source.filename}
                    </span>
                    {source.url && (
                      <span className="text-slate-ink/60 text-[11px] truncate block">
                        {source.url}
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-ink/40 group-hover:text-midnight-navy mt-0.5 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
