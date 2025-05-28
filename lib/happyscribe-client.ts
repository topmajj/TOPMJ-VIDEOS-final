import axios, { type AxiosError } from "axios"
import type {
  HappyScribeExport,
  HappyScribeTranscription,
  HappyScribeOrder,
  CreateExportRequest,
  CreateTranscriptionRequest,
  CreateOrderRequest,
} from "../types/happyscribe"

const API_BASE_URL = "https://www.happyscribe.com/api/v1"

// Helper function to get the organization ID from environment variables
function getOrganizationId(): string {
  const organizationId = process.env.HAPPY_SCRIBE_ORGANIZATION_ID
  if (!organizationId) {
    throw new Error("Happy Scribe organization ID is not configured.")
  }
  return organizationId
}

export async function getExportDetails(exportId: string): Promise<HappyScribeExport> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/exports/${exportId}`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  }

  try {
    const response = await axios.get<HappyScribeExport>(url, { headers })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(`Failed to fetch export details: ${axiosError.response.status} ${axiosError.response.statusText}`)
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}

export async function createTranscription(request: CreateTranscriptionRequest): Promise<HappyScribeTranscription> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY
  const organizationId = getOrganizationId()

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/transcriptions`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  try {
    // Wrap the request in a transcription object as per API docs
    const requestBody = {
      transcription: {
        ...request,
        organization_id: organizationId,
        is_subtitle: true, // Set to true for subtitle/translation use case
        service: "auto", // Use automatic transcription
      },
    }

    console.log("Creating transcription with request:", JSON.stringify(requestBody, null, 2))

    const response = await axios.post<HappyScribeTranscription>(url, requestBody, { headers })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(`Failed to create transcription: ${axiosError.response.status} ${axiosError.response.statusText}`)
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}

export async function createExport(request: CreateExportRequest): Promise<HappyScribeExport> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/exports`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  try {
    // Wrap the request in an export object as per API docs
    const requestBody = {
      export: {
        ...request,
      },
    }

    console.log("Creating export with request:", JSON.stringify(requestBody, null, 2))

    const response = await axios.post<HappyScribeExport>(url, requestBody, { headers })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(`Failed to create export: ${axiosError.response.status} ${axiosError.response.statusText}`)
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}

export async function getTranscriptionDetails(transcriptionId: string): Promise<HappyScribeTranscription> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/transcriptions/${transcriptionId}`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  }

  try {
    const response = await axios.get<HappyScribeTranscription>(url, { headers })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(
        `Failed to fetch transcription details: ${axiosError.response.status} ${axiosError.response.statusText}`,
      )
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}

// Function to wait for a transcription to be ready
export async function waitForTranscriptionReady(
  transcriptionId: string,
  maxAttempts = 10,
  delayMs = 5000,
): Promise<HappyScribeTranscription> {
  let attempts = 0

  while (attempts < maxAttempts) {
    const transcription = await getTranscriptionDetails(transcriptionId)
    console.log(`Transcription status (attempt ${attempts + 1}/${maxAttempts}):`, transcription.state)

    if (transcription.state === "automatic_done") {
      return transcription
    }

    if (transcription.state === "failed") {
      throw new Error("Transcription failed")
    }

    // Wait before checking again
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    attempts++
  }

  throw new Error(`Transcription not ready after ${maxAttempts} attempts`)
}

// List all transcriptions
export async function listTranscriptions(folderId?: string, page = 0): Promise<any> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY
  const organizationId = getOrganizationId()

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/transcriptions`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  }

  const params: any = {
    organization_id: organizationId,
    page,
  }

  if (folderId) {
    params.folder_id = folderId
  }

  try {
    const response = await axios.get(url, { headers, params })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(`Failed to list transcriptions: ${axiosError.response.status} ${axiosError.response.statusText}`)
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}

// Create a translation order
export async function createTranslationOrder(request: CreateOrderRequest): Promise<HappyScribeOrder> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/orders/translation`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  try {
    // Wrap the request in an order object as per API docs
    const requestBody = {
      order: request,
    }

    console.log("Creating translation order with request:", JSON.stringify(requestBody, null, 2))

    const response = await axios.post<HappyScribeOrder>(url, requestBody, { headers })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(
        `Failed to create translation order: ${axiosError.response.status} ${axiosError.response.statusText}`,
      )
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}

// Get order details
export async function getOrderDetails(orderId: string): Promise<HappyScribeOrder> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/orders/${orderId}`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  }

  try {
    const response = await axios.get<HappyScribeOrder>(url, { headers })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(`Failed to fetch order details: ${axiosError.response.status} ${axiosError.response.statusText}`)
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}

// Confirm an order
export async function confirmOrder(orderId: string): Promise<HappyScribeOrder> {
  const apiKey = process.env.HAPPY_SCRIBE_API_KEY

  if (!apiKey) {
    throw new Error("Happy Scribe API key is not configured.")
  }

  const url = `${API_BASE_URL}/orders/${orderId}/confirm`
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  }

  try {
    const response = await axios.post<HappyScribeOrder>(url, {}, { headers })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      console.error(
        `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        axiosError.response.data,
      )
      throw new Error(`Failed to confirm order: ${axiosError.response.status} ${axiosError.response.statusText}`)
    } else if (axiosError.request) {
      console.error("Network Error: No response received from Happy Scribe API.", axiosError.request)
      throw new Error("Network error while contacting Happy Scribe API.")
    } else {
      console.error("Error setting up API request:", axiosError.message)
      throw new Error(`Error during API request setup: ${axiosError.message}`)
    }
  }
}
