export const knowledgeBaseData = [
  {
    id: "1",
    question: "How do I create a new support ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Creating a new support ticket is easy! Follow these simple steps:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📝 Step 1: Navigate</h3>
            <p>Click on the "Create New Ticket" button in the sidebar navigation</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">✍️ Step 2: Fill Details</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Enter a clear, brief title describing your issue</li>
              <li>Provide detailed information in the description field</li>
              <li>Select the appropriate priority level</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">✅ Step 3: Submit</h3>
            <p>Click the "Submit" button to create your ticket</p>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <p class="text-green-800">Our support team will be notified and will respond to your ticket as soon as possible!</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "2",
    question: "How do I update my profile information?",
    answer: `
      <div class="space-y-6">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-2">🔄 Profile Update Options</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="font-medium">Personal Info</p>
              <p class="text-sm text-gray-600">Update your name and basic details</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="font-medium">Profile Picture</p>
              <p class="text-sm text-gray-600">Change your avatar image</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="font-medium">Account Info</p>
              <p class="text-sm text-gray-600">View your role and email</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900">Steps to Update Your Profile:</h3>
          <ol class="list-decimal pl-5 space-y-4">
            <li>
              <strong>Access Profile Settings</strong>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                <li>Click your email address in the top-right corner</li>
                <li>Select "Profile Settings" from the dropdown</li>
              </ul>
            </li>
            <li>
              <strong>Make Your Changes</strong>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                <li>Update your full name</li>
                <li>Click the upload icon to change profile picture</li>
                <li>Review your role and email information</li>
              </ul>
            </li>
            <li>
              <strong>Save Updates</strong>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                <li>Click "Save Changes" to update your information</li>
                <li>Wait for the confirmation message</li>
              </ul>
            </li>
          </ol>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p class="text-yellow-800"><strong>Note:</strong> Email addresses cannot be changed. Contact support if you need to update your email.</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "3",
    question: "How can I track the status of my ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 class="font-semibold text-purple-900 mb-2">🎯 Track Your Ticket</h3>
          <p class="text-purple-800">There are multiple ways to keep track of your support tickets. Here's everything you need to know:</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-3">📊 Dashboard View</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Recent tickets displayed on dashboard</li>
              <li>Current status indicators</li>
              <li>Last update timestamps</li>
              <li>Quick access to ticket details</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-3">🔍 Detailed View</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Complete ticket information</li>
              <li>Full conversation history</li>
              <li>Status change timeline</li>
              <li>Support agent responses</li>
            </ul>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-3">Understanding Ticket Statuses</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="font-medium text-yellow-600">OPEN</p>
              <p class="text-sm text-gray-600">Ticket created, awaiting assignment</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="font-medium text-blue-600">IN_PROGRESS</p>
              <p class="text-sm text-gray-600">Agent working on your ticket</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="font-medium text-green-600">RESOLVED</p>
              <p class="text-sm text-gray-600">Solution provided</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p class="font-medium text-gray-600">CLOSED</p>
              <p class="text-sm text-gray-600">Ticket completed</p>
            </div>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "4",
    question: "How do I provide feedback on a resolved ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <h3 class="font-semibold text-green-900 mb-2">⭐ Share Your Experience</h3>
          <p class="text-green-800">Your feedback helps us improve our support service! Here's how to share your thoughts:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">1</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Find Your Resolved Ticket</h3>
                <p class="text-gray-600">Navigate to the ticket that has been resolved</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">2</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Rate Your Experience</h3>
                <ul class="list-disc pl-5 space-y-2">
                  <li>Look for the "Rate Your Experience" section</li>
                  <li>Select a rating from 1 to 5 stars</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">3</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Add Detailed Feedback</h3>
                <ul class="list-disc pl-5 space-y-2">
                  <li>Share what worked well</li>
                  <li>Suggest areas for improvement</li>
                  <li>Describe your overall experience</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">4</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Submit Your Feedback</h3>
                <p class="text-gray-600">Click "Submit Feedback" to share your experience</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Your feedback helps us:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-blue-800">
            <li>Improve our support quality</li>
            <li>Train our support team</li>
            <li>Identify areas for improvement</li>
            <li>Better serve all our customers</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "5",
    question: "What should I do if I need to update my ticket with new information?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 class="font-semibold text-blue-900 mb-2">✏️ Update Your Ticket</h3>
          <p class="text-blue-800">Need to add more information to your existing ticket? Follow these simple steps:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">1</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Find Your Ticket</h3>
                <p class="text-gray-600">Open the ticket you want to update from your dashboard</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">2</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Navigate to Comments</h3>
                <p class="text-gray-600">Scroll to the bottom of the ticket where you'll find the comment section</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">3</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Add Information</h3>
                <p class="text-gray-600">Use the comment box to add your new information or updates</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-blue-100 rounded-full p-2 mr-4">
                <span class="text-xl">4</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Submit Update</h3>
                <p class="text-gray-600">Click "Add Note" to submit your update to the support team</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <h3 class="font-semibold text-green-900 mb-2">💡 Pro Tips:</h3>
          <ul class="list-disc pl-5 space-y-1 text-green-800">
            <li>Be clear and specific about any new information</li>
            <li>Mention if the update is urgent</li>
            <li>Reference any previous communications if relevant</li>
            <li>Include any new error messages or screenshots if applicable</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "6",
    question: "How do I change the language of the interface?",
    answer: `
      <div class="space-y-6">
        <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <h3 class="font-semibold text-indigo-900 mb-2">🌍 Language Settings</h3>
          <p class="text-indigo-800">Our application supports multiple languages to make it accessible for everyone. Here's how to change your language preference:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-center">
              <span class="text-2xl mr-4">🔍</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Locate Language Switcher</h3>
                <p class="text-gray-600">Find the language switcher in the top navigation bar of the application</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-center">
              <span class="text-2xl mr-4">🔄</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Open Language Menu</h3>
                <p class="text-gray-600">Click on your current language to see all available options</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-center">
              <span class="text-2xl mr-4">✨</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Select Language</h3>
                <p class="text-gray-600">Choose your preferred language from the dropdown menu</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 class="font-semibold text-purple-900 mb-2">Available Languages:</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            <div class="bg-white p-2 rounded text-center text-purple-800">English</div>
            <div class="bg-white p-2 rounded text-center text-purple-800">Español</div>
            <div class="bg-white p-2 rounded text-center text-purple-800">Français</div>
            <div class="bg-white p-2 rounded text-center text-purple-800">Deutsch</div>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <p class="text-green-800">✨ The interface will immediately update to display all text in your chosen language!</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "7",
    question: "What do the different ticket priorities mean?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 class="font-semibold text-blue-900 mb-2">🎯 Understanding Ticket Priorities</h3>
          <p class="text-blue-800">Choose the right priority level to help us better manage and respond to your ticket:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <div class="flex items-start">
              <span class="text-2xl mr-4">🟢</span>
              <div>
                <h3 class="font-semibold text-green-900 mb-2">Low Priority</h3>
                <ul class="list-disc pl-5 space-y-1 text-green-800">
                  <li>Minor issues that don't significantly impact work</li>
                  <li>Cosmetic issues or minor inconveniences</li>
                  <li>General questions about features</li>
                  <li>Documentation requests</li>
                </ul>
                <p class="text-sm text-green-700 mt-2">Response time: Within 24-48 hours</p>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div class="flex items-start">
              <span class="text-2xl mr-4">🟡</span>
              <div>
                <h3 class="font-semibold text-yellow-900 mb-2">Medium Priority</h3>
                <ul class="list-disc pl-5 space-y-1 text-yellow-800">
                  <li>Issues that affect work but have workarounds</li>
                  <li>Non-critical functionality problems</li>
                  <li>Performance issues</li>
                  <li>Issues affecting a small group of users</li>
                </ul>
                <p class="text-sm text-yellow-700 mt-2">Response time: Within 12-24 hours</p>
              </div>
            </div>
          </div>

          <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <div class="flex items-start">
              <span class="text-2xl mr-4">🔴</span>
              <div>
                <h3 class="font-semibold text-red-900 mb-2">High Priority</h3>
                <ul class="list-disc pl-5 space-y-1 text-red-800">
                  <li>Critical issues preventing work</li>
                  <li>System-wide problems</li>
                  <li>Security-related issues</li>
                  <li>Issues affecting multiple users or teams</li>
                </ul>
                <p class="text-sm text-red-700 mt-2">Response time: Within 1-4 hours</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-2">💡 How to Choose the Right Priority</h3>
          <ul class="list-disc pl-5 space-y-2 text-gray-700">
            <li>Consider the impact on your work and team</li>
            <li>Think about how many users are affected</li>
            <li>Evaluate if there are any workarounds available</li>
            <li>Assess the urgency of the solution needed</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "8",
    question: "How do I know if a support agent has responded to my ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <h3 class="font-semibold text-green-900 mb-2">🔔 Stay Updated</h3>
          <p class="text-green-800">Never miss a response! We've implemented multiple ways to keep you informed about your ticket updates:</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="text-center mb-4">
              <span class="text-3xl">📧</span>
              <h3 class="font-semibold text-gray-900 mt-2">Email Notifications</h3>
            </div>
            <ul class="list-disc pl-5 space-y-2 text-gray-600">
              <li>Instant email alerts</li>
              <li>Response content preview</li>
              <li>Direct ticket link</li>
              <li>Priority notifications</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="text-center mb-4">
              <span class="text-3xl">📊</span>
              <h3 class="font-semibold text-gray-900 mt-2">Dashboard Updates</h3>
            </div>
            <ul class="list-disc pl-5 space-y-2 text-gray-600">
              <li>Real-time status updates</li>
              <li>Highlighted new responses</li>
              <li>Activity indicators</li>
              <li>Response timestamps</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="text-center mb-4">
              <span class="text-3xl">📝</span>
              <h3 class="font-semibold text-gray-900 mt-2">Ticket Timeline</h3>
            </div>
            <ul class="list-disc pl-5 space-y-2 text-gray-600">
              <li>Complete history view</li>
              <li>Chronological updates</li>
              <li>Interaction tracking</li>
              <li>Status change log</li>
            </ul>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 class="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h3>
          <ul class="list-disc pl-5 space-y-1 text-blue-800">
            <li>Keep your email notifications enabled for the fastest updates</li>
            <li>Check your dashboard regularly for a complete overview</li>
            <li>Use the ticket timeline to track the full conversation history</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "9",
    question: "Can I reopen a closed ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 class="font-semibold text-purple-900 mb-2">🔄 Reopening a Ticket</h3>
          <p class="text-purple-800">Need to revisit a closed ticket? Here's what you need to know:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-purple-100 rounded-full p-2 mr-4">
                <span class="text-xl">1</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Find Your Ticket</h3>
                <p class="text-gray-600">Navigate to the closed ticket from your ticket history</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-purple-100 rounded-full p-2 mr-4">
                <span class="text-xl">2</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Explain the Reason</h3>
                <p class="text-gray-600">Add a new comment explaining why the ticket needs to be reopened</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-purple-100 rounded-full p-2 mr-4">
                <span class="text-xl">3</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Wait for Review</h3>
                <p class="text-gray-600">The support team will be notified and can reopen the ticket if needed</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <h3 class="font-semibold text-yellow-900 mb-2">⚠️ Important Note:</h3>
          <p class="text-yellow-800">If your issue is new but related to a closed ticket, we recommend creating a new ticket and referencing the closed ticket number. This helps us better track and manage different issues.</p>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 class="font-semibold text-blue-900 mb-2">💡 Best Practices:</h3>
          <ul class="list-disc pl-5 space-y-1 text-blue-800">
            <li>Clearly explain why the issue wasn't fully resolved</li>
            <li>Provide any new information that's relevant</li>
            <li>Reference any new developments since the ticket was closed</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "10",
    question: "How can I view my ticket history?",
    answer: `
      <div class="space-y-6">
        <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <h3 class="font-semibold text-indigo-900 mb-2">📚 Ticket History Access</h3>
          <p class="text-indigo-800">Access and manage your complete ticket history with these simple steps:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <span class="text-2xl mr-4">🎯</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Navigate to Dashboard</h3>
                <p class="text-gray-600">Click on "Dashboard" in the sidebar navigation to see your tickets overview</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <span class="text-2xl mr-4">📋</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">View Recent Tickets</h3>
                <p class="text-gray-600">Your recent tickets will be displayed with their current status</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-3">🔍 Filter and Search Options</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="bg-white p-3 rounded border border-gray-200">
                <p class="font-medium text-gray-900">Status Filter</p>
                <ul class="list-disc pl-4 text-sm text-gray-600 mt-1">
                  <li>Open</li>
                  <li>In Progress</li>
                  <li>Resolved</li>
                  <li>Closed</li>
                </ul>
              </div>
              <div class="bg-white p-3 rounded border border-gray-200">
                <p class="font-medium text-gray-900">Search Options</p>
                <ul class="list-disc pl-4 text-sm text-gray-600 mt-1">
                  <li>Ticket title</li>
                  <li>Content</li>
                  <li>Ticket number</li>
                </ul>
              </div>
              <div class="bg-white p-3 rounded border border-gray-200">
                <p class="font-medium text-gray-900">Sort By</p>
                <ul class="list-disc pl-4 text-sm text-gray-600 mt-1">
                  <li>Date</li>
                  <li>Priority</li>
                  <li>Status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 class="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h3>
          <ul class="list-disc pl-5 space-y-1 text-blue-800">
            <li>Use filters to quickly find specific tickets</li>
            <li>Click on any ticket to view its complete history</li>
            <li>Sort by date to track your most recent interactions</li>
            <li>Use the search function for specific issues or keywords</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "11",
    question: "What information should I include when creating a ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <h3 class="font-semibold text-green-900 mb-2">📝 Create an Effective Ticket</h3>
          <p class="text-green-800">Help us help you! The more information you provide, the faster we can resolve your issue.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <span class="text-2xl mr-4">📋</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Essential Information</h3>
                <ul class="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Clear, descriptive title</li>
                  <li>Detailed problem description</li>
                  <li>Steps to reproduce</li>
                  <li>Expected vs actual results</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <span class="text-2xl mr-4">🔍</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Supporting Details</h3>
                <ul class="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Error messages</li>
                  <li>Screenshots</li>
                  <li>System information</li>
                  <li>Related ticket numbers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-3">📝 Ticket Writing Guide</h3>
          <div class="grid grid-cols-1 gap-3">
            <div class="bg-white p-3 rounded border border-gray-200">
              <h4 class="font-medium text-gray-900 mb-2">1. What Were You Doing?</h4>
              <p class="text-gray-600">Describe the action or task you were trying to complete</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <h4 class="font-medium text-gray-900 mb-2">2. What Happened?</h4>
              <p class="text-gray-600">Explain what occurred vs what you expected to happen</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <h4 class="font-medium text-gray-900 mb-2">3. Impact Level</h4>
              <p class="text-gray-600">Describe how this affects your work (sets the priority)</p>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <h3 class="font-semibold text-yellow-900 mb-2">⭐ Best Practices:</h3>
          <ul class="list-disc pl-5 space-y-1 text-yellow-800">
            <li>Be specific and concise</li>
            <li>Include all relevant details</li>
            <li>Use clear, professional language</li>
            <li>Add screenshots for visual issues</li>
            <li>Mention any troubleshooting steps already tried</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "12",
    question: "How do I enable or disable email notifications?",
    answer: `
      <div class="space-y-6">
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 class="font-semibold text-purple-900 mb-2">🔔 Manage Your Notifications</h3>
          <p class="text-purple-800">Customize your email notifications to stay informed about your tickets in the way that works best for you.</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-purple-100 rounded-full p-2 mr-4">
                <span class="text-xl">1</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Access Settings</h3>
                <ul class="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Click your email address in the top-right corner</li>
                  <li>Select "Profile Settings" from the dropdown</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-purple-100 rounded-full p-2 mr-4">
                <span class="text-xl">2</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Find Notification Settings</h3>
                <p class="text-gray-600">Navigate to the "Notifications" section in your profile</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-3">Available Notification Types</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="bg-white p-3 rounded border border-gray-200">
                <h4 class="font-medium text-gray-900 mb-2">Ticket Updates</h4>
                <ul class="list-disc pl-4 text-sm text-gray-600">
                  <li>New responses</li>
                  <li>Status changes</li>
                  <li>Priority updates</li>
                </ul>
              </div>
              <div class="bg-white p-3 rounded border border-gray-200">
                <h4 class="font-medium text-gray-900 mb-2">Assignment Notifications</h4>
                <ul class="list-disc pl-4 text-sm text-gray-600">
                  <li>Agent assignments</li>
                  <li>Team transfers</li>
                  <li>Escalations</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start">
              <div class="bg-purple-100 rounded-full p-2 mr-4">
                <span class="text-xl">3</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Save Your Preferences</h3>
                <p class="text-gray-600">Click "Save Changes" to update your notification settings</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 class="font-semibold text-blue-900 mb-2">💡 Recommended Settings:</h3>
          <ul class="list-disc pl-5 space-y-1 text-blue-800">
            <li>Keep ticket response notifications enabled for timely updates</li>
            <li>Enable status change notifications to track progress</li>
            <li>Consider enabling assignment notifications for better tracking</li>
          </ul>
        </div>
      </div>
    `,
    is_published: true
  }
]; 