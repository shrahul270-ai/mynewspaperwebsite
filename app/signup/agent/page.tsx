'use client'
import { useState } from "react"
import {
    Upload,
    User,
    Phone,
    Mail,
    MapPin,
    Building,
    Calendar,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Gender = "male" | "female" | "other"

interface AgentSignupData {
    full_name: string
    mobile: string
    email: string
    password: string
    confirm_password: string

    address: string
    state: string
    district: string
    tehsil: string
    village: string
    pincode: string

    agency_name: string
    agency_phone: string

    age: number | string
    gender: Gender

    photo: File | null
    terms_accepted: boolean
}

export default function AgentSignupPage() {
    const navigate = useRouter()
    const [activeTab, setActiveTab] = useState("personal")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const [formData, setFormData] = useState<AgentSignupData>({
        full_name: "",
        mobile: "",
        email: "",
        password: "",
        confirm_password: "",
        address: "",
        state: "",
        district: "",
        tehsil: "",
        village: "",
        pincode: "",
        agency_name: "",
        agency_phone: "",
        age: "",
        gender: "male",
        photo: null,
        terms_accepted: false,
    })

    const progress = activeTab === "personal" ? 33 :
        activeTab === "address" ? 66 : 100

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        if (type === "checkbox") {
            const target = e.target as HTMLInputElement
            setFormData(prev => ({ ...prev, [name]: target.checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }))

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            alert("Passwords don't match!");
            return;
        }

        if (!formData.terms_accepted) {
            alert("Please accept the terms and conditions");
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === "confirm_password" || key === "terms_accepted") return;

                if (key === "photo" && value instanceof File) {
                    formDataToSend.append(key, value);
                } else if (value !== null && value !== undefined) {
                    formDataToSend.append(key, value.toString());
                }
            });

            const res = await fetch("/api/agent/signup", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Signup failed");
            }

            alert("Registration successful! Please wait for admin approval.");
            navigate.push("/pending-approval");
        } catch (error: any) {
            console.error("Registration failed:", error);
            alert(error.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const validateCurrentTab = () => {
        switch (activeTab) {
            case "personal":
                return formData.full_name && formData.mobile && formData.email &&
                    formData.password && formData.confirm_password
            case "address":
                return formData.address && formData.state && formData.district &&
                    formData.tehsil && formData.pincode
            case "agency":
                return formData.agency_name && formData.agency_phone &&
                    formData.age && formData.gender
            default:
                return false
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-background via-muted/20 to-background">

            {/* Left Side - Branding & Info */}
            <div className="md:w-1/2 bg-primary/10 p-8 md:p-12 flex flex-col justify-between">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-8"
                        onClick={() => navigate.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                                <span className="font-bold text-primary-foreground text-xl">A</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Agent Panel</h1>
                                <p className="text-muted-foreground">Professional Management System</p>
                            </div>
                        </div>

                        <Card className="bg-background/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Why Join as an Agent?</h2>
                                <ul className="space-y-3">
                                    {[
                                        "Manage multiple customers efficiently",
                                        "Track payments and deliveries in real-time",
                                        "Access comprehensive reporting tools",
                                        "Get dedicated support team",
                                        "Scale your agency operations"
                                    ].map((benefit, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-8">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login/agent" className="text-primary font-medium hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="md:w-1/2 p-4 md:p-8 lg:p-12 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">Become an Agent</h1>
                        <p className="text-muted-foreground mt-2">
                            Fill in your details to create your agent account
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Step {activeTab === "personal" ? 1 : activeTab === "address" ? 2 : 3} of 3</span>
                            <span className="text-sm font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3 mb-8">
                                <TabsTrigger value="personal">
                                    <User className="h-4 w-4 mr-2" />
                                    Personal
                                </TabsTrigger>
                                <TabsTrigger value="address">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Address
                                </TabsTrigger>
                                <TabsTrigger value="agency">
                                    <Building className="h-4 w-4 mr-2" />
                                    Agency
                                </TabsTrigger>
                            </TabsList>

                            {/* Personal Information Tab */}
                            <TabsContent value="personal">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>
                                            Enter your personal details and create login credentials
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="full_name">
                                                    <User className="inline h-4 w-4 mr-2" />
                                                    Full Name *
                                                </Label>
                                                <Input
                                                    id="full_name"
                                                    name="full_name"
                                                    placeholder="John Doe"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="mobile">
                                                    <Phone className="inline h-4 w-4 mr-2" />
                                                    Mobile Number *
                                                </Label>
                                                <Input
                                                    id="mobile"
                                                    name="mobile"
                                                    type="tel"
                                                    placeholder="9876543210"
                                                    value={formData.mobile}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                <Mail className="inline h-4 w-4 mr-2" />
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Minimum 8 characters with letters and numbers
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirm_password">Confirm Password *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirm_password"
                                                        name="confirm_password"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        value={formData.confirm_password}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={() => setActiveTab("address")}
                                                disabled={!validateCurrentTab()}
                                            >
                                                Next: Address Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Address Information Tab */}
                            <TabsContent value="address">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Address Information</CardTitle>
                                        <CardDescription>
                                            Enter your complete residential address
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Full Address *</Label>
                                            <Textarea
                                                id="address"
                                                name="address"
                                                placeholder="House no, Street, Area"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State *</Label>
                                                <Select
                                                    value={formData.state}
                                                    onValueChange={(value) => handleSelectChange("state", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select state" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            "Andhra Pradesh",
                                                            "Arunachal Pradesh",
                                                            "Assam",
                                                            "Bihar",
                                                            "Chhattisgarh",
                                                            "Goa",
                                                            "Gujarat",
                                                            "Haryana",
                                                            "Himachal Pradesh",
                                                            "Jharkhand",
                                                            "Karnataka",
                                                            "Kerala",
                                                            "Madhya Pradesh",
                                                            "Maharashtra",
                                                            "Manipur",
                                                            "Meghalaya",
                                                            "Mizoram",
                                                            "Nagaland",
                                                            "Odisha",
                                                            "Punjab",
                                                            "Rajasthan",
                                                            "Sikkim",
                                                            "Tamil Nadu",
                                                            "Telangana",
                                                            "Tripura",
                                                            "Uttar Pradesh",
                                                            "Uttarakhand",
                                                            "West Bengal",

                                                            // Union Territories
                                                            "Andaman and Nicobar Islands",
                                                            "Chandigarh",
                                                            "Dadra and Nagar Haveli and Daman and Diu",
                                                            "Delhi",
                                                            "Jammu and Kashmir",
                                                            "Ladakh",
                                                            "Lakshadweep",
                                                            "Puducherry"
                                                        ].map((state) => (
                                                            <SelectItem
                                                                key={state}
                                                                value={state.toLowerCase().replace(/\s+/g, "_")}
                                                            >
                                                                {state}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>

                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="district">District *</Label>
                                                <Input
                                                    id="district"
                                                    name="district"
                                                    placeholder="District name"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tehsil">Tehsil *</Label>
                                                <Input
                                                    id="tehsil"
                                                    name="tehsil"
                                                    placeholder="Tehsil name"
                                                    value={formData.tehsil}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="village">Village/Town</Label>
                                                <Input
                                                    id="village"
                                                    name="village"
                                                    placeholder="Village or town name"
                                                    value={formData.village}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pincode">Pincode *</Label>
                                            <Input
                                                id="pincode"
                                                name="pincode"
                                                placeholder="123456"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="flex justify-between">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setActiveTab("personal")}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => setActiveTab("agency")}
                                                disabled={!validateCurrentTab()}
                                            >
                                                Next: Agency Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Agency Information Tab */}
                            <TabsContent value="agency">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Agency & Profile Information</CardTitle>
                                        <CardDescription>
                                            Enter your agency details and personal information
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="agency_name">Agency Name *</Label>
                                                <Input
                                                    id="agency_name"
                                                    name="agency_name"
                                                    placeholder="Your agency name"
                                                    value={formData.agency_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="agency_phone">Agency Phone *</Label>
                                                <Input
                                                    id="agency_phone"
                                                    name="agency_phone"
                                                    type="tel"
                                                    placeholder="Agency contact number"
                                                    value={formData.agency_phone}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="age">
                                                    <Calendar className="inline h-4 w-4 mr-2" />
                                                    Age *
                                                </Label>
                                                <Input
                                                    id="age"
                                                    name="age"
                                                    type="number"
                                                    placeholder="30"
                                                    min="18"
                                                    max="100"
                                                    value={formData.age}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Gender *</Label>
                                                <RadioGroup
                                                    value={formData.gender}
                                                    onValueChange={(value: Gender) => handleSelectChange("gender", value)}
                                                    className="flex space-x-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="male" id="male" />
                                                        <Label htmlFor="male">Male</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="female" id="female" />
                                                        <Label htmlFor="female">Female</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="other" id="other" />
                                                        <Label htmlFor="other">Other</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Profile Photo</Label>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-20 w-20">
                                                    <AvatarImage src={previewImage || ""} alt="Preview" />
                                                    <AvatarFallback className="text-lg">
                                                        {formData.full_name ? formData.full_name.charAt(0) : "U"}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1">
                                                    <Input
                                                        id="photo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                    <Label htmlFor="photo">
                                                        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                            <p className="text-sm">
                                                                {formData.photo
                                                                    ? `Selected: ${formData.photo.name}`
                                                                    : "Click to upload profile photo"
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                JPG, PNG or WEBP. Max 2MB
                                                            </p>
                                                        </div>
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <Alert>
                                            <AlertDescription className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="terms_accepted"
                                                        name="terms_accepted"
                                                        checked={formData.terms_accepted}
                                                        onChange={handleInputChange}
                                                        className="mt-1"
                                                        required
                                                    />
                                                    <Label htmlFor="terms_accepted" className="font-normal">
                                                        I agree to the Terms of Service and Privacy Policy. I understand that
                                                        my account will be reviewed by administrators before approval.
                                                    </Label>
                                                </div>
                                            </AlertDescription>
                                        </Alert>

                                        <div className="flex justify-between">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setActiveTab("address")}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={!validateCurrentTab() || isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    "Complete Registration"
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-sm text-muted-foreground">
                            By registering, you agree to our{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Need help?{" "}
                            <Link href="/contact" className="text-primary hover:underline">
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}