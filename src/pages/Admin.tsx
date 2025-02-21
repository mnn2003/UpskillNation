"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "../lib/store"
import { Settings } from "lucide-react"

interface User {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  created_at: string
}

interface Registration {
  id: string
  event_id: string
  user_id: string
  status: string
  created_at: string
  event: {
    title: string
  }
  profiles: {
    full_name: string
    email: string
  }
}

interface Application {
  id: string
  job_id: string
  user_id: string
  resume_url: string
  cover_letter: string
  status: string
  created_at: string
  job: {
    title: string
  }
  profiles: {
    full_name: string
    email: string
  }
}

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"users" | "leads">("users")
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<Partial<User>>({})

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/dashboard")
      return
    }
    fetchUsers()
    fetchLeads()
  }, [user, isAdmin, navigate])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchLeads = async () => {
    try {
      const [registrationsData, applicationsData] = await Promise.all([
        supabase
          .from("event_registrations")
          .select(`
            *,
            event:events(title),
            profiles(full_name, email)
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("job_applications")
          .select(`
            *,
            job:jobs(title),
            profiles(full_name, email)
          `)
          .order("created_at", { ascending: false }),
      ])

      if (registrationsData.error) throw registrationsData.error
      if (applicationsData.error) throw applicationsData.error

      setRegistrations(registrationsData.data || [])
      setApplications(applicationsData.data || [])
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (userId: string, user: User) => {
    setEditingUser(userId)
    setEditedValues(user)
  }

  const handleSaveUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update(editedValues).eq("id", userId)

      if (error) throw error

      setUsers(users.map((u) => (u.id === userId ? { ...u, ...editedValues } : u)))
      setEditingUser(null)
      setEditedValues({})
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const updateLeadStatus = async (id: string, status: string, type: "registration" | "application") => {
    try {
      const table = type === "registration" ? "event_registrations" : "job_applications"
      const { error } = await supabase.from(table).update({ status }).eq("id", id)

      if (error) throw error

      if (type === "registration") {
        setRegistrations(registrations.map((r) => (r.id === id ? { ...r, status } : r)))
      } else {
        setApplications(applications.map((a) => (a.id === id ? { ...a, status } : a)))
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/content-management"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">Content Management</h3>
              <p className="text-sm text-gray-600">Manage all content</p>
            </div>
            <Settings className="w-6 h-6 text-primary-600" />
          </Link>
          {/* Add more quick action cards here */}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 sm:flex-none ${
                  activeTab === "users"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 sm:flex-none ${
                  activeTab === "leads"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Leads
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "users" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Admin
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <input
                              type="text"
                              value={editedValues.full_name || ""}
                              onChange={(e) => setEditedValues({ ...editedValues, full_name: e.target.value })}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <input
                              type="checkbox"
                              checked={editedValues.is_admin || false}
                              onChange={(e) => setEditedValues({ ...editedValues, is_admin: e.target.checked })}
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                          ) : (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.is_admin ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.is_admin ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingUser === user.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveUser(user.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button onClick={() => setEditingUser(null)} className="text-red-600 hover:text-red-900">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditUser(user.id, user)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-6">Event Registrations</h3>
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Event
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((registration) => (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{registration.event?.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{registration.profiles?.full_name}</div>
                            <div className="text-sm text-gray-500">{registration.profiles?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                registration.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : registration.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {registration.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              value={registration.status}
                              onChange={(e) => updateLeadStatus(registration.id, e.target.value, "registration")}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-6">Job Applications</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Job
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Applicant
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{application.job?.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{application.profiles?.full_name}</div>
                            <div className="text-sm text-gray-500">{application.profiles?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                application.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : application.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-4">
                              <select
                                value={application.status}
                                onChange={(e) => updateLeadStatus(application.id, e.target.value, "application")}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              {application.resume_url && (
                                <a
                                  href={application.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  View Resume
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
