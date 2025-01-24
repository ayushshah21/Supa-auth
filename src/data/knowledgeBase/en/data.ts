export const enKnowledgeBase = [
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
    question: "How do I update my ticket with new information?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">You can easily update your ticket with new information by following these steps:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Access Your Tickets</h3>
            <p>Go to 'My Tickets' in the navigation menu</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Select Your Ticket</h3>
            <p>Find and click on the ticket you want to update</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Add Information</h3>
            <p>Click the 'Edit' button and add your new information</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Save Changes</h3>
            <p>Click 'Save' to update your ticket with the new information</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "3",
    question: "How do I change the interface language?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Changing the interface language is a simple process:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Access Settings</h3>
            <p>Click on your profile in the top right corner</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Find Language Settings</h3>
            <p>Select 'Settings' and look for the 'Language Preferences' section</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Select Language</h3>
            <p>Choose your preferred language from the dropdown menu</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Apply Changes</h3>
            <p>The changes will be applied immediately</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "4",
    question: "What do the different ticket priority levels mean?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Understanding ticket priorities helps ensure proper handling of your issues:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🔴 High Priority</h3>
            <p>Critical issues requiring immediate attention</p>
            <ul class="list-disc pl-5 mt-2">
              <li>System-wide problems</li>
              <li>Service outages</li>
              <li>Security issues</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🟡 Medium Priority</h3>
            <p>Important issues that need to be resolved soon</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Partial functionality issues</li>
              <li>Performance problems</li>
              <li>Recurring issues</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🟢 Low Priority</h3>
            <p>Minor issues or general inquiries</p>
            <ul class="list-disc pl-5 mt-2">
              <li>General questions</li>
              <li>Feature requests</li>
              <li>Minor UI issues</li>
            </ul>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "5",
    question: "How do I know if a support agent has responded to my ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">You'll be notified of agent responses in several ways:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📧 Email Notification</h3>
            <p>You'll receive an email notification when there's a response</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🔔 Dashboard Update</h3>
            <p>The ticket status will be updated on your dashboard</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📝 Timeline Entry</h3>
            <p>You can view the response in the ticket's timeline</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "6",
    question: "Can I reopen a closed ticket?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Yes, you can reopen a closed ticket by following these steps:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Find Your Ticket</h3>
            <p>Go to 'My Tickets' and locate the closed ticket</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Reopen Action</h3>
            <p>Click the 'Reopen Ticket' button</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Provide Reason</h3>
            <p>Explain why you're reopening the ticket</p>
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p class="text-yellow-800">Note: If the issue is related but different, we recommend creating a new ticket instead.</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "7",
    question: "How do I view my ticket history?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">You can view your complete ticket history in a few simple steps:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Access Tickets</h3>
            <p>Go to 'My Tickets' in the navigation menu</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. View List</h3>
            <p>You'll see a list of all your tickets</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Filter Options</h3>
            <p>Use filters to sort by status (Open, Closed, etc.)</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. View Details</h3>
            <p>Click any ticket to see its complete history and details</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "8",
    question: "How do I manage my ticket email notifications?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">You can customize your email notifications in your profile settings:</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Access Settings</h3>
            <p>Go to your Profile Settings</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Notification Preferences</h3>
            <p>Find the 'Notification Preferences' section</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Choose Notifications</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Ticket updates</li>
              <li>Agent responses</li>
              <li>Status changes</li>
              <li>Reminders</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Save Preferences</h3>
            <p>Don't forget to save your notification preferences</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  }
]; 