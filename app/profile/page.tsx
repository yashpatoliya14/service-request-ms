"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-hot-toast"
import { uploadProfilePhoto } from "@/services/upload"

interface UserProfile {
  UserID: string
  Email: string
  Role: string
  FullName: string
  Username: string
  ProfilePhoto?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    FullName: "",
    ProfilePhoto: ""
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        const userData = result.data[0]
        setProfile(userData)
        setFormData({
          FullName: userData.FullName || "",
          ProfilePhoto: userData.ProfilePhoto || ""
        })
      } else {
        toast.error(`Failed to load profile data: ${result.message}`)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Error loading profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      let profilePhotoUrl = formData.ProfilePhoto
      
      // Upload image if a new file is selected
      if (selectedFile) {
        const oldPublicID = profile?.ProfilePhoto?.split("/").reverse()[0].split(".")[0];
        profilePhotoUrl = await uploadProfilePhoto(selectedFile, oldPublicID)
      }

      const response = await fetch("/api/auth/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          FullName: formData.FullName,
          ProfilePhoto: profilePhotoUrl
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Profile updated successfully!")
        setSelectedFile(null)
        fetchProfile()
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile")
    } finally {
      setUpdating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedFile ? URL.createObjectURL(selectedFile) : formData.ProfilePhoto} alt={profile.FullName} />
                <AvatarFallback className="text-lg">
                  {profile.FullName?.charAt(0).toUpperCase() || profile.Email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a new profile picture
                </p>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Picture</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>

            {/* Full Name Input */}
            <div className="space-y-2">
              <Label htmlFor="FullName">Full Name</Label>
              <Input
                id="FullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.FullName}
                onChange={(e) => handleInputChange("FullName", e.target.value)}
                required
              />
            </div>

            {/* Read-only Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.Email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  type="text"
                  value={profile.Username}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                type="text"
                value={profile.Role}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
