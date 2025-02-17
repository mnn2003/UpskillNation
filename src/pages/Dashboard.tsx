import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import { Calendar, Briefcase, Users, LogOut, Settings, UserIcon, Save } from "lucide-react"
import { useAuthStore } from "../lib/store"

interface UserProfile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string
  email: string
  phone: string
}

interface DashboardData {
  events: any[]
  jobs: any[]
  posts: any[]
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [data, setData] = useState<DashboardData>({
    events: [],
    jobs: [],
    posts: [],
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate("/auth")
      return
    }
    fetchProfile()
    fetchDashboardData()
  }, [user, navigate])

  const fetchProfile = async () => {
    if (!user) return

    try {
      let { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create it
        const newProfile = {
          id: user.id,
          full_name: "",
          email: user.email,
          avatar_url: null,
          bio: "",
          phone: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_admin: false,
        }

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single()

        if (createError) throw createError
        profile = createdProfile
      } else if (error) {
        throw error
      }

      setProfile(profile)
      setEditedProfile(profile || {})
    } catch (error) {
      console.error("Error fetching/creating profile:", error)
    }
  }

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      const [eventsData, jobsData, postsData] = await Promise.all([
        supabase
          .from("events")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("jobs").select("*").eq("created_by", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("posts").select("*").eq("created_by", user.id).order("created_at", { ascending: false }).limit(5),
      ])

      setData({
        events: eventsData.data || [],
        jobs: jobsData.data || [],
        posts: postsData.data || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate("/auth")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true)
      setSaveError(null)
      
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // First, try to delete any existing avatar
      try {
        const { data: existingFiles } = await supabase
          .storage
          .from('avatars')
          .list(user.id)

        for (const existingFile of existingFiles || []) {
          await supabase
            .storage
            .from('avatars')
            .remove([`${user.id}/${existingFile.name}`])
        }
      } catch (error) {
        console.log('No existing avatar to delete')
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const avatarUrl = publicUrlData.publicUrl

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
      setEditedProfile(prev => ({ ...prev, avatar_url: avatarUrl }))

    } catch (error) {
      console.error("Error uploading avatar:", error)
      setSaveError("Failed to upload avatar. Please try again.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaveError(null)

    try {
      const updates = {
        full_name: editedProfile.full_name || "",
        bio: editedProfile.bio || "",
        avatar_url: editedProfile.avatar_url,
        phone: editedProfile.phone || "",
        email: editedProfile.email || user.email,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

      if (error) throw error

      setProfile({ ...profile, ...updates } as UserProfile)
      setEditing(false)
      await fetchProfile() // Refresh profile data
    } catch (error) {
      console.error("Error updating profile:", error)
      setSaveError("Failed to save profile changes. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center mb-4 md:mb-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-0 md:mr-6">
                {profile?.avatar_url ? (
                  <img
                    src={`${profile.avatar_url}?${new Date().getTime()}`}
                    alt={profile.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                  </div>
                )}
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer transition-all duration-300 hover:bg-primary-700">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                    <Settings className="w-5 h-5 text-white" />
                  </label>
                )}
              </div>
              <div>
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedProfile.full_name || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={editedProfile.email || user?.email || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={editedProfile.phone || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      placeholder="Phone Number"
                    />
                    <textarea
                      value={editedProfile.bio || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      placeholder="Bio"
                    />
                    {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setEditedProfile(profile || {})
                          setSaveError(null)
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl md:text-3xl font-semibold">{profile?.full_name || "User"}</h2>
                    <p className="text-gray-600">{profile?.email || user?.email}</p>
                    {profile?.phone && <p className="text-gray-600">{profile.phone}</p>}
                    <p className="text-gray-600 mt-2">{profile?.bio || "No bio yet"}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-300"
                  title="Admin Panel"
                >
                  <Users className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={() => setEditing(!editing)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-300"
                title="Edit Profile"
              >
                <Settings className="w-6 h-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-300"
                title="Sign Out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Events Section */}
          <DashboardCard title="Your Events" icon={<Calendar className="w-6 h-6 text-primary-600" />}>
            {data.events.length > 0 ? (
              <ul className="space-y-4">
                {data.events.map((event) => (
                  <li key={event.id} className="border-b pb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">{new Date(event.start_date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No events yet</p>
            )}
          </DashboardCard>

          {/* Jobs Section */}
          <DashboardCard title="Your Job Posts" icon={<Briefcase className="w-6 h-6 text-primary-600" />}>
            {data.jobs.length > 0 ? (
              <ul className="space-y-4">
                {data.jobs.map((job) => (
                  <li key={job.id} className="border-b pb-2">
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No job posts yet</p>
            )}
          </DashboardCard>

          {/* Community Posts Section */}
          <DashboardCard title="Your Posts" icon={<Users className="w-6 h-6 text-primary-600" />}>
            {data.posts.length > 0 ? (
              <ul className="space-y-4">
                {data.posts.map((post) => (
                  <li key={post.id} className="border-b pb-2">
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{post.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No posts yet</p>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}

const DashboardCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        {icon}
      </div>
      {children}
    </div>
  )
}

export default Dashboard