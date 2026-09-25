import { useState } from "react";
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

function TeamMemberForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

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

    const dbRecord = {
      name: formData.name.trim(),
      location: formData.location,
      career_level: Number(formData.careerLevel),
      primary_skill: formData.primarySkill.trim(),
      secondary_skill: formData.secondarySkill.trim() || null,
      email: formData.email.trim(),
      phone_number: formData.phoneNumber.trim() || null,
      role: formData.role,
    };

    console.log("Saving team member:", dbRecord);

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("team_members")
        .insert([dbRecord]);

      if (error) {
        console.error("Supabase insert failed:", error);
        setSubmitError(
          "Unable to register the team member. Please try again."
        );
        return;
      }

      setSuccessMessage(
        "Team member has been registered successfully."
      );

      setErrors({});
      setFormData(initialFormData);
    } catch (error) {
      console.error("Unexpected submission error:", error);

      setSubmitError(
        "Something went wrong while registering the team member."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isSubmitting) return;

    setFormData(initialFormData);
    setErrors({});
    setSuccessMessage("");
    setSubmitError("");
  };

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