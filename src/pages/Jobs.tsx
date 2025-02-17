import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Briefcase, MapPin, Building2, Search, Filter } from 'lucide-react';
import { useAuthStore } from '../lib/store';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  salary_range: string;
  created_at: string;
}

interface Application {
  job_id: string;
  status: string;
}

const Jobs = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Record<string, Application>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
  });
  const [showApplicationForm, setShowApplicationForm] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeUrl: '',
  });

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchUserApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('job_id, status')
        .eq('user_id', user!.id);

      if (error) throw error;

      const applicationsMap = data.reduce((acc, app) => ({
        ...acc,
        [app.job_id]: app
      }), {});

      setApplications(applicationsMap);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([
          {
            job_id: jobId,
            user_id: user.id,
            cover_letter: applicationData.coverLetter,
            resume_url: applicationData.resumeUrl,
          }
        ]);

      if (error) throw error;

      // Update local state
      setApplications({
        ...applications,
        [jobId]: { job_id: jobId, status: 'pending' }
      });
      setShowApplicationForm(null);
      setApplicationData({ coverLetter: '', resumeUrl: '' });
    } catch (error) {
      console.error('Error applying for job:', error);
    }
  };

  const getApplicationStatus = (jobId: string) => {
    return applications[jobId]?.status || null;
  };

  const getStatusButton = (job: Job) => {
    const status = getApplicationStatus(job.id);

    switch (status) {
      case 'pending':
        return (
          <button disabled className="bg-yellow-500 text-white py-2 px-6 rounded-lg opacity-75 cursor-not-allowed">
            Application Pending
          </button>
        );
      case 'approved':
        return (
          <button disabled className="bg-green-500 text-white py-2 px-6 rounded-lg opacity-75 cursor-not-allowed">
            Application Approved
          </button>
        );
      case 'rejected':
        return (
          <button disabled className="bg-red-500 text-white py-2 px-6 rounded-lg opacity-75 cursor-not-allowed">
            Application Rejected
          </button>
        );
      default:
        return (
          <button
            onClick={() => setShowApplicationForm(job.id)}
            className="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition"
          >
            Apply Now
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600">
            Explore opportunities from top companies
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="rounded-md border-gray-300 py-2 px-4"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
              </select>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="rounded-md border-gray-300 py-2 px-4"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                <option value="on-site">On Site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        <span>{job.company}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.type && (
                        <div className="flex items-center">
                          <Briefcase className="w-5 h-5 mr-2" />
                          <span>{job.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    {getStatusButton(job)}
                  </div>
                </div>
                {job.description && (
                  <p className="mt-4 text-gray-600">{job.description}</p>
                )}
                {job.salary_range && (
                  <div className="mt-4 text-gray-600">
                    <span className="font-medium">Salary Range: </span>
                    {job.salary_range}
                  </div>
                )}

                {/* Application Form */}
                {showApplicationForm === job.id && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Submit Your Application</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleApply(job.id);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Resume URL
                        </label>
                        <input
                          type="url"
                          value={applicationData.resumeUrl}
                          onChange={(e) => setApplicationData({ ...applicationData, resumeUrl: e.target.value })}
                          className="w-full rounded-md border-gray-300"
                          placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cover Letter
                        </label>
                        <textarea
                          value={applicationData.coverLetter}
                          onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                          className="w-full rounded-md border-gray-300"
                          rows={4}
                          placeholder="Why are you interested in this position?"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowApplicationForm(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Submit Application
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;