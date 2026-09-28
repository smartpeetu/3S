import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const initialFormData = {
  name: "",
  location: "",
  careerLevel: "",
  primarySkill: "",
  secondarySkill: "",
  email: "",
  phoneNumber: "",
  role: "",
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function TeamMemberForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Please upload a valid image (JPEG, PNG, or WebP).",
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        photo: "Photo file size exceeds the 5 MB limit.",
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview("");
    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.location) {
      newErrors.location = "Please select a location.";
    }

    if (!formData.careerLevel) {
      newErrors.careerLevel = "Please select a career level.";
    }

    if (!formData.primarySkill.trim()) {
      newErrors.primarySkill = "Primary skill is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.phoneNumber && !/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must contain only numbers.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role.";
    }

    if (photoFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(photoFile.type)) {
        newErrors.photo = "Please upload a valid image (JPEG, PNG, or WebP).";
      } else if (photoFile.size > MAX_PHOTO_SIZE_BYTES) {
        newErrors.photo = "Photo file size exceeds the 5 MB limit.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    let uploadedFilePath = null;

    try {
      let photoUrl = null;

      // Upload photo to Supabase Storage if one was selected
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop().toLowerCase();
        const sanitizedBase = photoFile.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 30);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${sanitizedBase}.${fileExt}`;
        const filePath = `team-members/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("team-member-photos")
          .upload(filePath, photoFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase photo upload failed:", uploadError);
          const feedbackMessage = uploadError.message
            ? `Photo upload failed: ${uploadError.message}`
            : "Unable to upload the profile photo. Please try again.";
          setSubmitError(feedbackMessage);
          setErrors((prev) => ({
            ...prev,
            photo: feedbackMessage,
          }));
          return;
        }

        uploadedFilePath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("team-member-photos")
          .getPublicUrl(filePath);

        photoUrl = publicUrlData?.publicUrl || null;
      }

      const dbRecord = {
        name: formData.name.trim(),
        location: formData.location,
        career_level: Number(formData.careerLevel),
        primary_skill: formData.primarySkill.trim(),
        secondary_skill: formData.secondarySkill.trim() || null,
        email: formData.email.trim(),
        phone_number: formData.phoneNumber.trim() || null,
        role: formData.role,
        photo_url: photoUrl,
      };

      console.log("Saving team member:", dbRecord);

      const { error } = await supabase
        .from("team_members")
        .insert([dbRecord]);

      if (error) {
        console.error("Supabase insert failed:", error);

        // Roll back uploaded photo to prevent orphaned storage objects
        if (uploadedFilePath) {
          try {
            await supabase.storage
              .from("team-member-photos")
              .remove([uploadedFilePath]);
          } catch (cleanupErr) {
            console.warn("Storage cleanup failed:", cleanupErr);
          }
        }

        setSubmitError(
          error.message
            ? `Database error: ${error.message}`
            : "Unable to register the team member. Please try again."
        );
        return;
      }

      setSuccessMessage(
        "Team member has been registered successfully."
      );

      // Clean up form inputs and photo previews
      setErrors({});
      setFormData(initialFormData);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(null);
      setPhotoPreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Unexpected submission error:", error);

      // Roll back uploaded photo on unexpected error
      if (uploadedFilePath) {
        try {
          await supabase.storage
            .from("team-member-photos")
            .remove([uploadedFilePath]);
        } catch (cleanupErr) {
          console.warn("Storage cleanup failed:", cleanupErr);
        }
      }

      setSubmitError(
        error?.message
          ? `Unexpected error: ${error.message}`
          : "Something went wrong while registering the team member."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isSubmitting) return;

    setFormData(initialFormData);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors({});
    setSuccessMessage("");
    setSubmitError("");
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const closeSuccessPopup = () => {
    setSuccessMessage("");
  };

  return (
    <>
      <div className="min-h-screen bg-[#f5f3f7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#7500c0]">
                3S APPLICATION
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2b2b] sm:text-3xl">
                Team Member Registration
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Register a team member by providing their basic
                professional information.
              </p>
            </div>

            {/* Accent mark */}
            <div className="hidden sm:block">
              <div className="flex items-end gap-1">
                <span className="h-7 w-2 bg-[#a100ff]" />
                <span className="h-10 w-2 bg-[#7500c0]" />
                <span className="h-14 w-2 bg-[#460073]" />
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">

            {/* Purple top bar */}
            <div className="h-1.5 bg-[#a100ff]" />

            <div className="p-6 sm:p-8">

              {/* Section heading */}
              <div className="mb-7 border-b border-gray-200 pb-5">
                <h2 className="text-lg font-semibold text-[#2b2b2b]">
                  Team Member Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Fields marked with{" "}
                  <span className="text-red-500">*</span>{" "}
                  are mandatory.
                </p>
              </div>

              {/* Error Message */}
              {submitError && (
                <div
                  className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>

                  <div>
                    <p className="font-medium">
                      Registration failed
                    </p>

                    <p className="mt-0.5">
                      {submitError}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[#7500c0]">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <FormField
                      label="Name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="Enter full name"
                    />

                    <FormField
                      label="Email ID"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="Enter email address"
                    />

                    <FormField
                      label="Phone Number"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      error={errors.phoneNumber}
                      placeholder="Enter phone number"
                      inputMode="numeric"
                    />

                    <SelectField
                      label="Location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      error={errors.location}
                      options={[
                        {
                          value: "BLR",
                          label: "Bangalore (BLR)",
                        },
                        {
                          value: "PUN",
                          label: "Pune (PUN)",
                        },
                        {
                          value: "HYD",
                          label: "Hyderabad (HYD)",
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="mb-8">
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[#7500c0]">
                    Professional Information
                  </h3>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <SelectField
                      label="Career Level"
                      name="careerLevel"
                      required
                      value={formData.careerLevel}
                      onChange={handleChange}
                      error={errors.careerLevel}
                      options={[
                        {
                          value: "7",
                          label: "Level 7",
                        },
                        {
                          value: "8",
                          label: "Level 8",
                        },
                        {
                          value: "9",
                          label: "Level 9",
                        },
                        {
                          value: "10",
                          label: "Level 10",
                        },
                      ]}
                    />

                    <SelectField
                      label="Role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      error={errors.role}
                      options={[
                        {
                          value: "Admin",
                          label: "Admin",
                        },
                        {
                          value: "User",
                          label: "User",
                        },
                      ]}
                    />

                    <FormField
                      label="Primary Skill"
                      name="primarySkill"
                      required
                      value={formData.primarySkill}
                      onChange={handleChange}
                      error={errors.primarySkill}
                      placeholder="e.g. Java, React, Python"
                    />

                    <FormField
                      label="Secondary Skill"
                      name="secondarySkill"
                      value={formData.secondarySkill}
                      onChange={handleChange}
                      error={errors.secondarySkill}
                      placeholder="e.g. Node.js, AWS, SQL"
                    />
                  </div>
                </div>

                {/* Profile Photo (at bottom of form) */}
                <div className="mb-8">
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[#7500c0]">
                    Profile Photo
                  </h3>

                  <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Upload Photo
                      <span className="ml-1 text-xs font-normal text-gray-500">
                        (Optional)
                      </span>
                    </label>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* Avatar Preview */}
                      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-white shadow-sm">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Controls and hints */}
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          id="photo-upload"
                          name="photo"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          disabled={isSubmitting}
                          className="hidden"
                          aria-label="Upload profile photo"
                        />

                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#a100ff] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <svg
                              className="h-3.5 w-3.5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                            {photoPreview ? "Change Photo" : "Choose Photo"}
                          </button>

                          {photoPreview && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              disabled={isSubmitting}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>

                        <p className="mt-1.5 text-xs text-gray-500">
                          Allowed: JPG, PNG, WebP · Maximum size: 5 MB
                        </p>

                        {errors.photo && (
                          <p className="mt-1.5 text-xs text-red-600">
                            {errors.photo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#a100ff] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-w-[190px] items-center justify-center gap-2 rounded-md bg-[#7500c0] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f0099] focus:outline-none focus:ring-2 focus:ring-[#a100ff] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9b59c4]"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <span>Register Team Member</span>
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-gray-500">
            3S Application · Team Member Registration
          </p>
        </div>
      </div>

      {/* Success Popup */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={closeSuccessPopup}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading Spinner                                                            */
/* -------------------------------------------------------------------------- */

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        className="opacity-90"
        fill="currentColor"
        d="M21 12a9 9 0 0 1-9 9v-3a6 6 0 0 0 6-6h3Z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Success Modal                                                              */
/* -------------------------------------------------------------------------- */

function SuccessModal({ message, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <div className="w-full max-w-md animate-[successIn_0.25s_ease-out] rounded-2xl bg-white p-8 text-center shadow-2xl">

        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2
          id="success-title"
          className="mt-5 text-xl font-semibold text-gray-900"
        >
          Registration Successful
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {message}
        </p>

        {/* Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-[#7500c0] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f0099] focus:outline-none focus:ring-2 focus:ring-[#a100ff] focus:ring-offset-2"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable Text Input                                                        */
/* -------------------------------------------------------------------------- */

function FormField({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
  error,
  placeholder,
  ...props
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}

        {required && (
          <span
            className="ml-1 text-red-500"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${name}-error` : undefined
        }
        className={`w-full rounded-md border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-300 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20"
        }`}
        {...props}
      />

      {error && (
        <p
          id={`${name}-error`}
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable Select                                                            */
/* -------------------------------------------------------------------------- */

function SelectField({
  label,
  name,
  required = false,
  value,
  onChange,
  error,
  options,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}

        {required && (
          <span
            className="ml-1 text-red-500"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${name}-error` : undefined
        }
        className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-300 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20"
        }`}
      >
        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          id={`${name}-error`}
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default TeamMemberForm;