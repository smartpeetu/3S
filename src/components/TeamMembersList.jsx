import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";
import TeamMemberForm from "./TeamMemberForm";
import DeleteConfirmModal from "./DeleteConfirmModal";

const PAGE_SIZE = 10;

function TeamMembersList({ onBack }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [careerLevelFilter, setCareerLevelFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sub-views: null = list table, 'add' = creating, 'edit' = editing
  const [activeFormMode, setActiveFormMode] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  // Delete modal state
  const [deletingMember, setDeletingMember] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all team members from Supabase
  const fetchTeamMembers = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");

    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch failed:", error);
        setFetchError(error.message || "Unable to load team members. Please try again.");
      } else {
        setMembers(data || []);
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      setFetchError("Unable to load team members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .order("created_at", { ascending: false });

        if (!ignore) {
          if (error) {
            console.error("Supabase fetch failed:", error);
            setFetchError(error.message || "Unable to load team members. Please try again.");
          } else {
            setMembers(data || []);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Unexpected fetch error:", err);
          setFetchError("Unable to load team members. Please try again.");
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.name?.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q) ||
        member.phone_number?.toLowerCase().includes(q) ||
        member.primary_skill?.toLowerCase().includes(q) ||
        member.secondary_skill?.toLowerCase().includes(q);

      // Location filter
      const matchesLocation =
        locationFilter === "ALL" || member.location === locationFilter;

      // Role filter
      const matchesRole =
        roleFilter === "ALL" || member.role === roleFilter;

      // Career Level filter
      const matchesCareerLevel =
        careerLevelFilter === "ALL" ||
        String(member.career_level) === careerLevelFilter;

      return matchesSearch && matchesLocation && matchesRole && matchesCareerLevel;
    });
  }, [members, searchQuery, locationFilter, roleFilter, careerLevelFilter]);

  // Pagination calculations (10 records at a time)
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedMembers = useMemo(() => {
    return filteredMembers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredMembers, startIndex]);

  // Handle Edit click
  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setActiveFormMode("edit");
  };

  // Form completed (Edit)
  const handleFormSuccess = () => {
    setActiveFormMode(null);
    setEditingMember(null);
    setActionSuccess(
      editingMember
        ? "Team member details updated successfully."
        : "New team member added successfully."
    );
    fetchTeamMembers();

    // Auto-clear notification after 4 seconds
    setTimeout(() => {
      setActionSuccess("");
    }, 4000);
  };

  // Form cancelled
  const handleFormCancel = () => {
    setActiveFormMode(null);
    setEditingMember(null);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deletingMember) return;

    setIsDeleting(true);
    try {
      // Remove from team_members table
      const { data, error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", deletingMember.id)
        .select();

      if (error) {
        console.error("Delete failed:", error);
        alert(`Failed to delete team member: ${error.message}`);
        setIsDeleting(false);
        return;
      }

      if (!data || data.length === 0) {
        alert(
          "Delete blocked by Supabase: Row Level Security (RLS) did not permit deleting this row. Please check your Supabase DELETE policy or disable RLS."
        );
        setIsDeleting(false);
        return;
      }

      // If member had a photo stored in our Supabase bucket, attempt cleanup
      if (deletingMember.photo_url && deletingMember.photo_url.includes("team-member-photos")) {
        try {
          const urlParts = deletingMember.photo_url.split("team-member-photos/");
          if (urlParts.length > 1) {
            const storagePath = decodeURIComponent(urlParts[1].split("?")[0]);
            await supabase.storage.from("team-member-photos").remove([storagePath]);
          }
        } catch (cleanupErr) {
          console.warn("Could not delete photo file from storage:", cleanupErr);
        }
      }

      // Update state locally
      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
      setActionSuccess(`"${deletingMember.name}" has been deleted.`);
      setDeletingMember(null);

      setTimeout(() => {
        setActionSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Unexpected delete error:", err);
      alert("An unexpected error occurred while deleting the team member.");
    } finally {
      setIsDeleting(false);
    }
  };

  // If in Add or Edit form view, render the form with back navigation
  if (activeFormMode) {
    return (
      <div className="min-h-screen bg-[#f5f3f7] px-4 py-8 sm:px-6 lg:px-8">
        <TeamMemberForm
          key={activeFormMode === "edit" ? editingMember?.id : "new"}
          initialData={activeFormMode === "edit" ? editingMember : null}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          embedded={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1536px]">

        {/* Top Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#7500c0]">
              3S APPLICATION
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2b2b] sm:text-3xl">
              Manage Team Members
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage all registered team members from a single directory.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-[#7500c0] hover:bg-purple-50 hover:text-[#7500c0] focus:outline-none focus:ring-2 focus:ring-[#7500c0]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchTeamMembers}
              disabled={isLoading}
              title="Refresh list"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#a100ff] disabled:opacity-50"
            >
              <svg
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>

            {/* Add Team Member Button */}
            <button
              type="button"
              onClick={() => {
                setEditingMember(null);
                setActiveFormMode("add");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7500c0] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5f009d] focus:outline-none focus:ring-2 focus:ring-[#7500c0] focus:ring-offset-2"
              title="Add a new team member"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Team Member</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div
            className="mb-6 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-sm transition-all"
            role="status"
          >
            <div className="flex items-center gap-2.5">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess("")}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {fetchError && (
          <div
            className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm"
            role="alert"
          >
            <div className="flex items-center gap-2.5">
              <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Unable to load team members. Please try again. ({fetchError})</span>
            </div>
            <button
              type="button"
              onClick={fetchTeamMembers}
              className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter and Search Bar Card */}
        <div className="mb-6 rounded-xl bg-white p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input & Horizontal Filter Groups */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              {/* Compact Search Input */}
              <div className="relative w-44 sm:w-52 shrink-0">
                <label htmlFor="search-input" className="sr-only">Search</label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search members..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-2.5 text-xs sm:text-sm text-gray-900 outline-none transition focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20"
                />
              </div>

              {/* Location Clickable Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-semibold text-gray-500">Location:</span>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-xs">
                  {[
                    { label: "All", value: "ALL" },
                    { label: "BLR", value: "BLR" },
                    { label: "PUN", value: "PUN" },
                    { label: "HYD", value: "HYD" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLocationFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                        locationFilter === opt.value
                          ? "bg-[#7500c0] text-white shadow-xs font-semibold"
                          : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Career Level Clickable Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-semibold text-gray-500">Level:</span>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-xs">
                  {[
                    { label: "All", value: "ALL" },
                    { label: "7", value: "7" },
                    { label: "8", value: "8" },
                    { label: "9", value: "9" },
                    { label: "10", value: "10" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setCareerLevelFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                        careerLevelFilter === opt.value
                          ? "bg-[#7500c0] text-white shadow-xs font-semibold"
                          : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Clickable Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-semibold text-gray-500">Role:</span>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-xs">
                  {[
                    { label: "All", value: "ALL" },
                    { label: "Admin", value: "Admin" },
                    { label: "User", value: "User" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setRoleFilter(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                        roleFilter === opt.value
                          ? "bg-[#7500c0] text-white shadow-xs font-semibold"
                          : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Counts & Clear Action */}
            <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0 ml-auto">
              <span>
                Showing <strong className="font-semibold text-gray-700">{filteredMembers.length}</strong> of{" "}
                <strong className="font-semibold text-gray-700">{members.length}</strong> members
              </span>
              {(searchQuery || locationFilter !== "ALL" || roleFilter !== "ALL" || careerLevelFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setLocationFilter("ALL");
                    setRoleFilter("ALL");
                    setCareerLevelFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className="font-medium text-[#7500c0] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          {/* Top brand line */}
          <div className="h-1.5 bg-[#a100ff]" />

          {isLoading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="h-10 w-10 animate-spin text-[#7500c0]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" fill="currentColor" d="M21 12a9 9 0 0 1-9 9v-3a6 6 0 0 0 6-6h3Z" />
              </svg>
              <p className="mt-4 text-base font-medium text-gray-700">
                Loading team members...
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Connecting to database...
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-[#7500c0]">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No team members found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {members.length === 0
                  ? "There are no team members in the database yet. Get started by adding a team member."
                  : "No records match your search or filter criteria."}
              </p>
              {members.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setActiveFormMode("add");
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#7500c0] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5f009d]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Team Member</span>
                </button>
              )}
              {members.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setLocationFilter("ALL");
                    setRoleFilter("ALL");
                    setCareerLevelFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className="mt-4 text-sm font-medium text-[#7500c0] hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            /* Table with records */
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-gray-700">
                <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  <tr>
                    <th scope="col" className="w-12 px-2.5 py-3 text-center">
                      Photo
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Phone
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Location
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Career Level
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Role
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Primary Skill
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Secondary Skill
                    </th>
                    <th scope="col" className="px-2.5 py-3 text-right pr-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-purple-50/30"
                    >
                      {/* Photo Column */}
                      <td className="whitespace-nowrap px-2.5 py-2.5 text-center">
                        <div className="mx-auto flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-xs">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback icon on broken image
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className="text-[11px] font-bold uppercase text-[#7500c0]"
                            style={{ display: member.photo_url ? "none" : "flex" }}
                          >
                            {member.name
                              ? member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                              : "?"}
                          </span>
                        </div>
                      </td>

                      {/* Name Column */}
                      <td className="whitespace-nowrap px-2.5 py-2.5 font-medium text-gray-900">
                        {member.name}
                      </td>

                      {/* Email Column */}
                      <td className="px-2.5 py-2.5 text-gray-600">
                        <a
                          href={`mailto:${member.email}`}
                          title={member.email}
                          className="block max-w-[150px] truncate hover:text-[#7500c0] hover:underline xl:max-w-[210px]"
                        >
                          {member.email}
                        </a>
                      </td>

                      {/* Phone Column */}
                      <td className="whitespace-nowrap px-2.5 py-2.5 text-gray-600">
                        {member.phone_number || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Location Column */}
                      <td className="whitespace-nowrap px-2.5 py-2.5">
                        <LocationBadge location={member.location} />
                      </td>

                      {/* Career Level Column */}
                      <td className="whitespace-nowrap px-2.5 py-2.5">
                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-[#7500c0] ring-1 ring-inset ring-[#7500c0]/20">
                          Level {member.career_level}
                        </span>
                      </td>

                      {/* Role Column */}
                      <td className="whitespace-nowrap px-2.5 py-2.5">
                        <RoleBadge role={member.role} />
                      </td>

                      {/* Primary Skill Column */}
                      <td className="px-2.5 py-2.5 font-medium text-gray-800">
                        <span className="block max-w-[110px] truncate" title={member.primary_skill}>
                          {member.primary_skill}
                        </span>
                      </td>

                      {/* Secondary Skill Column */}
                      <td className="px-2.5 py-2.5 text-gray-600">
                        {member.secondary_skill ? (
                          <span className="block max-w-[110px] truncate" title={member.secondary_skill}>
                            {member.secondary_skill}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="whitespace-nowrap px-2.5 py-2.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(member)}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-[#7500c0] hover:bg-purple-50 hover:text-[#7500c0] focus:outline-none focus:ring-2 focus:ring-[#a100ff]"
                            title={`Edit ${member.name}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingMember(member)}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow-xs transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                            title={`Delete ${member.name}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (10 records at a time) */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:px-6">
              <div className="text-xs text-gray-600 sm:text-sm">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(startIndex + PAGE_SIZE, filteredMembers.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {filteredMembers.length}
                </span>{" "}
                records
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7500c0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        totalPages > 7 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - safeCurrentPage) > 1
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return (
                            <span key={pageNum} className="px-1 text-xs text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[32px] rounded-md px-2.5 py-1 text-xs sm:text-sm font-medium transition ${
                            safeCurrentPage === pageNum
                              ? "bg-[#7500c0] text-white shadow-xs"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7500c0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>Next</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            </>
          )}

          {/* Footer note */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3 text-xs text-gray-500">
            Records stored securely in database table <code className="rounded bg-gray-200/70 px-1 py-0.5 font-mono text-gray-700">team_members</code>
          </div>
        </div>

        {/* Page Footer */}
        <p className="mt-5 text-center text-xs text-gray-500">
          3S Application · Team Member Management Portal
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        member={deletingMember}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMember(null)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                     */
/* -------------------------------------------------------------------------- */

function LocationBadge({ location }) {
  const styles = {
    BLR: "bg-blue-50 text-blue-700 border-blue-200",
    PUN: "bg-amber-50 text-amber-700 border-amber-200",
    HYD: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const labels = {
    BLR: "Bangalore",
    PUN: "Pune",
    HYD: "Hyderabad",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[location] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {labels[location] || location}
    </span>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "Admin";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
        isAdmin
          ? "bg-purple-100 text-[#7500c0]"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {role}
    </span>
  );
}

export default TeamMembersList;
