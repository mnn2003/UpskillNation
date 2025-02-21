"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../lib/store"
import { Calendar, Briefcase, GraduationCap, MessageSquare, AlertTriangle } from "lucide-react"
import EventForm from "../components/admin/EventForm"
import JobForm from "../components/admin/JobForm"
import LearnForm from "../components/admin/LearnForm"
import ContentList from "../components/admin/ContentList"

interface ContentItem {
  id: string
  title: string
  description: string
  type: "event" | "job" | "learn" | "post"
  created_at: string
  start_date?: string
  end_date?: string
  location?: string
  category?: string
  company?: string
  type_job?: string
  salary_range?: string
}

const ContentManagement = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuthStore()
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewContentForm, setShowNewContentForm] = useState(false)
  const [newContentType, setNewContentType] = useState<"event" | "job" | "learn">("event")
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    category: "",
    company: "",
    type: "",
    salary_range: "",
  })
  const [editingContent, setEditingContent] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<Partial<ContentItem>>({})
  const [activeTab, setActiveTab] = useState<"events" | "jobs" | "learn" | "posts">("events")
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; type: string } | null>(null)

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/dashboard")
      return
    }
    fetchContent()
  }, [user, isAdmin, navigate, activeTab])

  const fetchContent = async () => {
    try {
      let data
      switch (activeTab) {
        case "events":
          const { data: events } = await supabase.from("events").select("*").order("created_at", { ascending: false })
          data = events?.map((event) => ({ ...event, type: "event" as const }))
          break
        case "jobs":
          const { data: jobs } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
          data = jobs?.map((job) => ({ ...job, type: "job" as const }))
          break
        case "learn":
          const { data: learn } = await supabase.from("learn").select("*").order("created_at", { ascending: false })
          data = learn?.map((item) => ({ ...item, type: "learn" as const }))
          break
        case "posts":
          const { data: posts } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
          data = posts?.map((post) => ({ ...post, type: "post" as const }))
          break
      }
      setContent(data || [])
    } catch (error) {
      console.error("Error fetching content:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditContent = (contentId: string, item: ContentItem) => {
    setEditingContent(contentId)
    setEditedContent(item)
  }

  const handleSaveContent = async (contentId: string, type: string) => {
    try {
      const tableName = type === "event" ? "events" : type === "job" ? "jobs" : type === "learn" ? "learn" : "posts"

      const { type: _, ...updateData } = editedContent

      const { error } = await supabase.from(tableName).update(updateData).eq("id", contentId)

      if (error) throw error

      setContent(content.map((c) => (c.id === contentId ? { ...c, ...editedContent } : c)))
      setEditingContent(null)
      setEditedContent({})
      await fetchContent()
    } catch (error) {
      console.error("Error updating content:", error)
    }
  }

  const handleDeleteContent = async (id: string, type: string) => {
    setDeleteConfirmation({ id, type })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return

    try {
      const { id, type } = deleteConfirmation
      const tableName = type === "event" ? "events" : type === "job" ? "jobs" : type === "learn" ? "learn" : "posts"

      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) throw error

      setContent(content.filter((item) => item.id !== id))
      setDeleteConfirmation(null)
    } catch (error) {
      console.error("Error deleting content:", error)
    }
  }

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const tableName = newContentType === "event" ? "events" : newContentType === "job" ? "jobs" : "learn"

      let contentData = {
        title: newContent.title,
        description: newContent.description,
        created_by: user.id,
      }

      if (newContentType === "event" || newContentType === "learn") {
        contentData = {
          ...contentData,
          start_date: newContent.start_date,
          end_date: newContent.end_date,
          location: newContent.location,
          category: newContent.category,
        }
      } else if (newContentType === "job") {
        contentData = {
          ...contentData,
          company: newContent.company,
          location: newContent.location,
          type: newContent.type,
          salary_range: newContent.salary_range,
        }
      }

      const { error, data } = await supabase.from(tableName).insert([contentData]).select().single()

      if (error) throw error

      setContent([{ ...data, type: newContentType }, ...content])
      setShowNewContentForm(false)
      setNewContent({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        category: "",
        company: "",
        type: "",
        salary_range: "",
      })
      await fetchContent()
    } catch (error) {
      console.error("Error creating content:", error)
    }
  }

  const renderContentForm = () => {
    switch (newContentType) {
      case "event":
        return (
          <EventForm
            newContent={newContent}
            setNewContent={setNewContent}
            handleCreateContent={handleCreateContent}
            onCancel={() => setShowNewContentForm(false)}
          />
        )
      case "job":
        return (
          <JobForm
            newContent={newContent}
            setNewContent={setNewContent}
            handleCreateContent={handleCreateContent}
            onCancel={() => setShowNewContentForm(false)}
          />
        )
      case "learn":
        return (
          <LearnForm
            newContent={newContent}
            setNewContent={setNewContent}
            handleCreateContent={handleCreateContent}
            onCancel={() => setShowNewContentForm(false)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("events")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === "events"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Events
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === "jobs"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Jobs
              </button>
              <button
                onClick={() => setActiveTab("learn")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === "learn"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Learning Resources
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === "posts"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Posts
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab !== "posts" && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => {
                    setNewContentType(activeTab === "events" ? "event" : activeTab === "jobs" ? "job" : "learn")
                    setShowNewContentForm(true)
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {activeTab === "events" && <Calendar className="h-5 w-5 mr-2" />}
                  {activeTab === "jobs" && <Briefcase className="h-5 w-5 mr-2" />}
                  {activeTab === "learn" && <GraduationCap className="h-5 w-5 mr-2" />}
                  Create New {activeTab === "events" ? "Event" : activeTab === "jobs" ? "Job" : "Learning Resource"}
                </button>
              </div>
            )}

            {showNewContentForm && renderContentForm()}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading content...</p>
              </div>
            ) : (
              <ContentList
                content={content}
                editingContent={editingContent}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
                handleEditContent={handleEditContent}
                handleSaveContent={handleSaveContent}
                handleDeleteContent={handleDeleteContent}
                setEditingContent={setEditingContent}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Content
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this content? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentManagement
