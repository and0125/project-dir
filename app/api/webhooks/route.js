import { Webhook } from "svix";
import { headers } from "next/headers";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

export async function POST(request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  let event;

  // Verify payload with headers
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = event?.data;
  const eventType = event?.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  if (eventType === "user.created" || eventType === "user.updated") {
    console.log("user created or updated");

    const { id, first_name, last_name, image_url, email_addresses, username } =
      event?.data;

    try {
      await createOrUpdateUser(
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username
      );
    } catch (error) {
      console.log("error creating or updating user: ", error);
      return new Response("Error Occurred", {
        status: 400,
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = event?.data;
    try {
      await deleteUser(id);
      return new Response("user is deleted", {
        status: 200,
      });
    } catch (error) {
      console.log("error deleting user:", error);
      return new Response("error occured", { status: 400 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
