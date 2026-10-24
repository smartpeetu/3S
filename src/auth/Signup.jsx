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
  password: "",
  confirmPassword: "",
};

function Signup({ onBack }) {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const {
      name,
      location,
      careerLevel,
      primarySkill,
      secondarySkill,
      email,
      phoneNumber,
      password,
      confirmPassword,
    } = formData;

    if (
      !name.trim() ||
      !location ||
      !careerLevel ||
      !primarySkill.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@accenture\.com$/.test(normalizedEmail)) {
      setError("Please use your authorized @accenture.com email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
      setError("Phone number must contain only numbers.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            location,
            career_level: Number(careerLevel),
            primary_skill: primarySkill.trim(),
            secondary_skill: secondarySkill.trim() || null,
            phone_number: phoneNumber.trim() || null,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.session) {
        setSuccess(
          "Account created successfully. Your profile is being loaded."
        );
      } else {
        setSuccess(
          "Registration submitted. Check your email to confirm your account before logging in."
        );
      }

      setFormData(initialFormData);
    } catch (signupError) {
      console.error("Signup failed:", signupError);
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3f7] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="3S Logo"
            className="mx-auto mb-4 h-20 w-20 object-contain"
          />

          <h1 className="text-3xl font-semibold tracking-tight text-[#2b2b2b]">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Register using your authorized Accenture email address.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="h-1.5 bg-[#a100ff]" />

          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3.5 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            <section className="mb-8">
              <h2 className="mb-5 border-b border-gray-200 pb-3 text-sm font-semibold uppercase tracking-wide text-[#7500c0]">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />

                <Field
                  label="Email ID"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@accenture.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />

                <Field
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={loading}
                  inputMode="numeric"
                />

                <SelectField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  options={[
                    { value: "BLR", label: "Bangalore (BLR)" },
                    { value: "PUN", label: "Pune (PUN)" },
                    { value: "HYD", label: "Hyderabad (HYD)" },
                  ]}
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-5 border-b border-gray-200 pb-3 text-sm font-semibold uppercase tracking-wide text-[#7500c0]">
                Professional Information
              </h2>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <SelectField
                  label="Career Level"
                  name="careerLevel"
                  value={formData.careerLevel}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  options={[
                    { value: "7", label: "Level 7" },
                    { value: "8", label: "Level 8" },
                    { value: "9", label: "Level 9" },
                    { value: "10", label: "Level 10" },
                  ]}
                />

                <Field
                  label="Primary Skill"
                  name="primarySkill"
                  value={formData.primarySkill}
                  onChange={handleChange}
                  placeholder="e.g. Java, React, Python"
                  required
                  disabled={loading}
                />

                <Field
                  label="Secondary Skill"
                  name="secondarySkill"
                  value={formData.secondarySkill}
                  onChange={handleChange}
                  placeholder="e.g. Node.js, AWS, SQL"
                  disabled={loading}
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-5 border-b border-gray-200 pb-3 text-sm font-semibold uppercase tracking-wide text-[#7500c0]">
                Account Security
              </h2>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />

                <Field
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 accent-[#7500c0]"
                />
                Show passwords
              </label>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#7500c0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f0099] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="mt-5 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="font-semibold text-[#7500c0] hover:underline"
              >
                Back to Login
              </button>
            </p>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          3S Application · Authorized team members only
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  ...props
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:bg-gray-100"
        {...props}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#7500c0] focus:ring-2 focus:ring-[#7500c0]/20 disabled:bg-gray-100"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Signup;