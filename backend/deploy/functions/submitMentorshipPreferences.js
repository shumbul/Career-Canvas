"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const database_1 = require("../utils/database");
functions_1.app.http('submitMentorshipPreferences', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        context.log('Mentorship preferences request received');
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            };
        }
        try {
            // Get request body
            const body = await request.json();
            context.log('Request body:', body);
            // Validate required fields
            if (!body.userId || !body.mentorshipType) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'User ID and mentorship type are required'
                        }
                    })
                };
            }
            // Connect to database
            const db = await (0, database_1.connectToDatabase)();
            const preferencesCollection = db.collection('mentorship_preferences');
            // Create preferences document
            const preferencesDoc = {
                userId: body.userId,
                mentorshipType: body.mentorshipType,
                preferences: {
                    industries: ((_a = body.preferences) === null || _a === void 0 ? void 0 : _a.industries) || [],
                    skills: ((_b = body.preferences) === null || _b === void 0 ? void 0 : _b.skills) || [],
                    careerLevels: ((_c = body.preferences) === null || _c === void 0 ? void 0 : _c.careerLevels) || [],
                    meetingFrequency: ((_d = body.preferences) === null || _d === void 0 ? void 0 : _d.meetingFrequency) || 'monthly',
                    communicationStyle: ((_e = body.preferences) === null || _e === void 0 ? void 0 : _e.communicationStyle) || 'casual',
                    goals: ((_f = body.preferences) === null || _f === void 0 ? void 0 : _f.goals) || [],
                    timeCommitment: ((_g = body.preferences) === null || _g === void 0 ? void 0 : _g.timeCommitment) || '1-2-hours',
                    remotePreference: ((_h = body.preferences) === null || _h === void 0 ? void 0 : _h.remotePreference) || 'hybrid'
                },
                availability: {
                    timezone: ((_j = body.availability) === null || _j === void 0 ? void 0 : _j.timezone) || 'UTC',
                    preferredTimes: ((_k = body.availability) === null || _k === void 0 ? void 0 : _k.preferredTimes) || [],
                    startDate: ((_l = body.availability) === null || _l === void 0 ? void 0 : _l.startDate) ? new Date(body.availability.startDate) : new Date(),
                    endDate: ((_m = body.availability) === null || _m === void 0 ? void 0 : _m.endDate) ? new Date(body.availability.endDate) : null
                },
                bio: body.bio || '',
                experience: body.experience || '',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Upsert preferences (update if exists, insert if not)
            const result = await preferencesCollection.replaceOne({ userId: body.userId }, preferencesDoc, { upsert: true });
            context.log('Preferences saved with result:', result);
            // Return success response
            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    preferenceId: result.upsertedId ? result.upsertedId.toString() : 'updated',
                    message: 'Preferences saved successfully'
                })
            };
        }
        catch (error) {
            context.log('Error saving preferences:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to save preferences'
                    }
                })
            };
        }
    }
});
//# sourceMappingURL=submitMentorshipPreferences.js.map