import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to Enkaji Trade Kenya</p>
        </div>

        <SignIn />
      </div>
    </div>
  )
}
