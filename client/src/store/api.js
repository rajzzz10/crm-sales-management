import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
  }),

  tagTypes: [
    "Auth",
    "Leads",
    "Customers",
    "Deals",
    "Activities",
    "Notifications",
    "Dashboard",
    "Users",
    "Timeline",
  ],

  endpoints: (builder) => ({
    // AUTH

    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Dashboard"],
    }),

    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    // USERS

    getUsers: builder.query({
      query: (params = {}) => ({
        url: "/users",
        params,
      }),
      providesTags: ["Users"],
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    // LEADS

    getLeads: builder.query({
      query: (params = {}) => ({
        url: "/leads",
        params,
      }),
      providesTags: ["Leads"],
    }),

    getLead: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: "Leads", id }],
    }),

    createLead: builder.mutation({
      query: (lead) => ({
        url: "/leads",
        method: "POST",
        body: lead,
      }),
      invalidatesTags: ["Leads", "Dashboard"],
    }),

    updateLead: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Leads", "Dashboard"],
    }),

    assignLead: builder.mutation({
      query: ({ id, assignedTo }) => ({
        url: `/leads/${id}/assign`,
        method: "PATCH",
        body: { assignedTo },
      }),
      invalidatesTags: ["Leads", "Dashboard", "Notifications"],
    }),

    updateLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Leads", "Dashboard"],
    }),

    addLeadNote: builder.mutation({
      query: ({ id, text }) => ({
        url: `/leads/${id}/notes`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Leads"],
    }),

    convertLead: builder.mutation({
      query: (id) => ({
        url: `/leads/${id}/convert`,
        method: "POST",
      }),
      invalidatesTags: [
        "Leads",
        "Customers",
        "Deals",
        "Dashboard",
        "Notifications",
      ],
    }),

    // CUSTOMERS

    getCustomers: builder.query({
      query: (params = {}) => ({
        url: "/customers",
        params,
      }),
      providesTags: ["Customers"],
    }),

    getCustomer: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: "Customers", id }],
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),

    // DEALS

    getDeals: builder.query({
      query: (params = {}) => ({
        url: "/deals",
        params,
      }),
      providesTags: ["Deals"],
    }),

    getDeal: builder.query({
      query: (id) => `/deals/${id}`,
      providesTags: (result, error, id) => [{ type: "Deals", id }],
    }),

    updateDeal: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/deals/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Deals", "Dashboard"],
    }),

    updateDealStage: builder.mutation({
      query: ({ id, stage }) => ({
        url: `/deals/${id}/stage`,
        method: "PATCH",
        body: { stage },
      }),
      invalidatesTags: ["Deals", "Dashboard", "Notifications"],
    }),

    // ACTIVITIES

    getActivities: builder.query({
      query: (params = {}) => ({
        url: "/activities",
        params,
      }),
      providesTags: ["Activities"],
    }),

    createActivity: builder.mutation({
      query: (activity) => ({
        url: "/activities",
        method: "POST",
        body: activity,
      }),
      invalidatesTags: ["Activities", "Dashboard", "Notifications"],
    }),

    completeActivity: builder.mutation({
      query: (id) => ({
        url: `/activities/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Activities", "Dashboard"],
    }),

    // NOTIFICATIONS

    getNotifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),

    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // DASHBOARD

    getDashboardStats: builder.query({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
    }),

    getTimeline: builder.query({
      query: ({ lead, customer, deal }) => ({
        url: "/timeline",
        params: {
          ...(lead && { lead }),
          ...(customer && { customer }),
          ...(deal && { deal }),
        },
      }),
      providesTags: ["Timeline"],
    }),
  }),
});

// HOOKS

export const {
  // Auth
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,

  //users
  useGetUsersQuery,
  useCreateUserMutation,

  // Leads
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useAssignLeadMutation,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
  useConvertLeadMutation,

  // Customers
  useGetCustomersQuery,
  useGetCustomerQuery,
  useUpdateCustomerMutation,

  // Deals
  useGetDealsQuery,
  useGetDealQuery,
  useUpdateDealMutation,
  useUpdateDealStageMutation,

  // Activities
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useCompleteActivityMutation,

  // Notifications
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,

  // Dashboard
  useGetDashboardStatsQuery,

  //Timeline
  useGetTimelineQuery,
} = api;
