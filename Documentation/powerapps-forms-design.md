# PowerApps Form Designs

## 1. Career Story Submission Form

### Form Structure
```
┌─────────────────────────────────────┐
│            Career Story             │
├─────────────────────────────────────┤
│ Title: [Text Input - Required]      │
│                                     │
│ Category: [Dropdown - Required]     │
│ └─ Leadership                       │
│ └─ Technical Achievement            │
│ └─ Career Change                    │
│ └─ Mentorship Experience           │
│ └─ Teamwork                        │
│ └─ Problem Solving                 │
│                                     │
│ Story Content: [Rich Text Editor]   │
│ [Large text area - Required]        │
│                                     │
│ Tags: [Combo Box - Multi-select]    │
│ Add relevant tags...                │
│                                     │
│ Career Level: [Dropdown]            │
│ └─ Entry Level                      │
│ └─ Mid-Level                        │
│ └─ Senior Level                     │
│ └─ Executive                        │
│                                     │
│ Industry: [Dropdown]                │
│ └─ Technology                       │
│ └─ Finance                          │
│ └─ Healthcare                       │
│ └─ [Auto-populate from profile]     │
│                                     │
│ Attachments: [Attachment Control]   │
│ Upload images or documents...       │
│                                     │
│ ☑ Make this story public           │
│                                     │
│ [Submit Story] [Save Draft]         │
└─────────────────────────────────────┘
```

### PowerApps Controls Configuration

**Title Input:**
- Control: Text Input
- Property: `Required = true`
- Property: `MaxLength = 200`
- Validation: `If(Len(txtTitle.Text) < 5, "Title must be at least 5 characters", "")`

**Category Dropdown:**
- Control: Dropdown
- Items: `["Leadership", "Technical Achievement", "Career Change", "Mentorship Experience", "Teamwork", "Problem Solving"]`
- Property: `Required = true`

**Story Content:**
- Control: Rich Text Editor
- Property: `MaxLength = 5000`
- Property: `Required = true`
- Validation: `If(Len(rtStoryContent.HtmlText) < 50, "Story must be at least 50 characters", "")`

**Tags:**
- Control: Combo Box
- Property: `SelectMultiple = true`
- Items: Dynamic from existing tags or predefined list

**Submit Button Logic:**
```powerx
// OnSelect property
If(
    And(
        !IsBlank(txtTitle.Text),
        !IsBlank(ddCategory.Selected.Value),
        !IsBlank(rtStoryContent.HtmlText)
    ),
    // Submit to API
    Set(
        varSubmitResult,
        'HTTP Connector'.SubmitStory(
            {
                userId: User().Email,
                title: txtTitle.Text,
                content: rtStoryContent.HtmlText,
                category: ddCategory.Selected.Value,
                tags: ComboBoxTags.SelectedItems.Value,
                careerLevel: ddCareerLevel.Selected.Value,
                industry: ddIndustry.Selected.Value,
                isPublic: chkPublic.Value,
                createdAt: Now()
            }
        )
    );
    If(
        varSubmitResult.success,
        // Success
        Notify("Story submitted successfully!", NotificationType.Success);
        Navigate(StoriesGallery),
        // Error
        Notify("Error submitting story: " & varSubmitResult.error.message, NotificationType.Error)
    ),
    // Validation failed
    Notify("Please fill in all required fields", NotificationType.Warning)
)
```

## 2. Mentorship Preferences Form

### Form Structure
```
┌─────────────────────────────────────┐
│       Mentorship Preferences        │
├─────────────────────────────────────┤
│ I am looking to:                    │
│ ○ Find a mentor                     │
│ ○ Become a mentor                   │
│ ○ Both mentor and be mentored       │
│                                     │
│ Industries of Interest:             │
│ ☐ Technology    ☐ Finance           │
│ ☐ Healthcare    ☐ Education         │
│ ☐ Marketing     ☐ Operations        │
│                                     │
│ Skills Focus: [Combo Box Multi]     │
│ Select skills to learn/teach...     │
│                                     │
│ Preferred Mentor/Mentee Level:      │
│ ☐ Entry Level   ☐ Mid-Level         │
│ ☐ Senior Level  ☐ Executive         │
│                                     │
│ Meeting Frequency: [Dropdown]       │
│ └─ Weekly                           │
│ └─ Bi-weekly                        │
│ └─ Monthly                          │
│ └─ As needed                        │
│                                     │
│ Communication Style: [Dropdown]     │
│ └─ Formal structured sessions       │
│ └─ Casual conversations             │
│ └─ Goal-oriented meetings           │
│                                     │
│ Career Goals: [Text Area]           │
│ What do you want to achieve?        │
│                                     │
│ Time Commitment: [Dropdown]         │
│ └─ 1-2 hours/month                  │
│ └─ 3-5 hours/month                  │
│ └─ 6+ hours/month                   │
│                                     │
│ Remote Preference: [Radio]          │
│ ○ Remote only                       │
│ ○ In-person preferred              │
│ ○ Hybrid (both)                    │
│                                     │
│ Availability:                       │
│ Timezone: [Dropdown]                │
│ Preferred Times:                    │
│ ☐ Monday AM    ☐ Monday PM          │
│ ☐ Tuesday AM   ☐ Tuesday PM         │
│ [Continue for all days...]          │
│                                     │
│ Bio/Introduction: [Text Area]       │
│ Tell others about yourself...       │
│                                     │
│ [Save Preferences] [Find Matches]   │
└─────────────────────────────────────┘
```

### PowerApps Controls Configuration

**Mentorship Type:**
- Control: Radio Button
- Items: `["seeking-mentor", "offering-mentor", "both"]`
- DisplayNames: `["Find a mentor", "Become a mentor", "Both"]`

**Industries:**
- Control: Checkbox (multiple)
- Items: Predefined industry list
- Value: Collection of selected industries

**Skills Focus:**
- Control: Combo Box
- Property: `SelectMultiple = true`
- Items: Dynamic skills database or predefined list

**Meeting Frequency:**
- Control: Dropdown
- Items: `["weekly", "bi-weekly", "monthly", "as-needed"]`

**Preferred Times:**
- Control: Checkbox Group
- Custom component with day/time matrix
- Value: Collection of selected time slots

**Submit Logic:**
```powerx
// OnSelect for Save Preferences button
Set(
    varPreferencesResult,
    'HTTP Connector'.SubmitPreferences(
        {
            userId: User().Email,
            mentorshipType: rdoMentorshipType.Selected.Value,
            preferences: {
                industries: Filter(colIndustries, Selected = true).Value,
                skills: ComboBoxSkills.SelectedItems.Value,
                careerLevels: Filter(colCareerLevels, Selected = true).Value,
                meetingFrequency: ddFrequency.Selected.Value,
                communicationStyle: ddCommStyle.Selected.Value,
                goals: txtGoals.Text,
                timeCommitment: ddTimeCommitment.Selected.Value,
                remotePreference: rdoRemotePreference.Selected.Value
            },
            availability: {
                timezone: ddTimezone.Selected.Value,
                preferredTimes: Filter(colTimeSlots, Selected = true).Value
            },
            bio: txtBio.Text,
            experience: txtExperience.Text,
            updatedAt: Now()
        }
    )
);

If(
    varPreferencesResult.success,
    Notify("Preferences saved successfully!", NotificationType.Success);
    Navigate(MentorMatches),
    Notify("Error saving preferences: " & varPreferencesResult.error.message, NotificationType.Error)
)
```

## 3. PowerApps App Structure

### Screens:
1. **Home Screen** - Navigation hub
2. **Story Submission** - Career story form
3. **Stories Gallery** - View submitted stories
4. **Mentorship Setup** - Preferences form
5. **Mentor Matches** - Browse and connect with mentors
6. **My Profile** - User profile and settings

### Data Sources:
1. **HTTP Connector** - Backend API calls
2. **Office365Users** - User profile data
3. **Collections** - Local data storage for offline capability

### Navigation:
```powerx
// Global navigation variables
Set(varCurrentUser, User());
Set(varUserProfile, Office365Users.MyProfile());

// Screen navigation with data passing
Navigate(
    StorySubmission,
    ScreenTransition.Fade,
    {
        userInfo: varUserProfile,
        returnScreen: "Home"
    }
)
```

This design provides a complete PowerApps solution that connects to your MongoDB backend through REST APIs, with proper validation, user experience, and offline capabilities! 🚀