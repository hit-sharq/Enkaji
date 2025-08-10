import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Enkaji Trade Kenya</h1>
          <p className="text-gray-600">Create your account to start trading</p>
        </div>

        <SignUp />
      </div>
    </div>
  )
}
