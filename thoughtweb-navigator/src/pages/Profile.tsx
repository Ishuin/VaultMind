import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { User, Camera, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Ishu Kumar',
    email: 'ishu.kumar@gmail.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'AI enthusiast and knowledge management expert. Building the future of intelligent information systems.',
    joinDate: 'March 2024',
    avatar: ''
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const stats = [
    { label: 'Queries Made', value: '1,247', change: '+12%' },
    { label: 'Documents Added', value: '89', change: '+8%' },
    { label: 'Knowledge Score', value: '94%', change: '+3%' },
    { label: 'Data Sources', value: '3', change: '+1' }
  ];

  const recentActivity = [
    { action: 'Added new document collection', time: '2 hours ago', type: 'upload' },
    { action: 'Updated API configuration', time: '5 hours ago', type: 'settings' },
    { action: 'Completed security audit', time: '1 day ago', type: 'security' },
    { action: 'Analyzed usage patterns', time: '2 days ago', type: 'analytics' }
  ];

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">Manage your account and view your activity</p>
          </div>

          {/* Profile Card */}
          <div className="glass-panel p-6 rounded-3xl mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-600 text-white text-xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 p-2 bg-cyan-500 rounded-full hover:bg-cyan-600 transition-colors">
                      <Camera className="w-4 h-4 text-black" />
                    </button>
                  )}
                </div>
                
                <div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Full Name</Label>
                        <Input
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-800/50 border-gray-600 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Bio</Label>
                        <Textarea
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                          className="bg-gray-800/50 border-gray-600 text-white mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
                      <p className="text-gray-400 mb-4 max-w-md">{profile.bio}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {profile.joinDate}</span>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          Pro Member
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-600 text-black">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="border-gray-600 text-gray-300">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="border-gray-600 text-gray-300">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Mail, label: 'Email', value: profile.email, key: 'email' },
                { icon: Phone, label: 'Phone', value: profile.phone, key: 'phone' },
                { icon: MapPin, label: 'Location', value: profile.location, key: 'location' }
              ].map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div 
                    key={index}
                    className="group relative overflow-hidden flex items-center gap-3 p-4 glass-panel rounded-lg"
                  >
                    <div className="relative z-10 flex items-center gap-3 w-full">
                      <Icon className="w-5 h-5 text-cyan-400" />
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">{contact.label}</p>
                        {isEditing ? (
                          <Input
                            value={editedProfile[contact.key as keyof typeof editedProfile] as string}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, [contact.key]: e.target.value }))}
                            className="bg-transparent border-none p-0 text-white focus:ring-0"
                          />
                        ) : (
                          <p className="text-white">{contact.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="group relative overflow-hidden glass-panel p-6 rounded-3xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <span className="text-cyan-400 text-sm">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="group relative overflow-hidden flex items-center justify-between p-4 glass-panel rounded-lg hover:border-cyan-500/50 transition-all"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;
