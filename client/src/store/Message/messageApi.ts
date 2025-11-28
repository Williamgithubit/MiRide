import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';

export interface Message {
  id: number;
  carId: number;
  ownerId: string;
  senderId: string;
  messageText: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  owner?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  car?: {
    id: number;
    brand: string;
    model: string;
    year: number;
  };
}

export interface MessageResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}

export interface SendMessageRequest {
  carId: number;
  ownerId: string;
  messageText: string;
}

export interface SendMessageResponse {
  message: string;
  data: Message;
}

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/messages`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Message'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: (data) => ({
        url: '/send',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Message'],
    }),
    getOwnerMessages: builder.query<MessageResponse, { limit?: number; offset?: number; unreadOnly?: boolean; carId?: number }>({
      query: ({ limit = 50, offset = 0, unreadOnly = false, carId } = {}) => ({
        url: '/owner',
        params: { limit, offset, unreadOnly, carId }
      }),
      providesTags: ['Message'],
    }),
    getSentMessages: builder.query<MessageResponse, { limit?: number; offset?: number }>({
      query: ({ limit = 50, offset = 0 } = {}) => ({
        url: '/sent',
        params: { limit, offset }
      }),
      providesTags: ['Message'],
    }),
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/owner/unread-count',
      providesTags: ['Message'],
    }),
    markMessageAsRead: builder.mutation<{ message: string; data: Message }, number>({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),
    deleteMessage: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetOwnerMessagesQuery,
  useGetSentMessagesQuery,
  useGetUnreadCountQuery,
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation,
} = messageApi;
