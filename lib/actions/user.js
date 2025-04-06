import User from "../models/user.model";
import { Connect } from "../mongodb/connect";

export async function createOrUpdateUser(
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username
) {
  try {
    await Connect();

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image_url,
          email: email_addresses,
          username: username,
        },
      },
      { new: true, upsert: true } // if user does not exist, create a new user -- this enables us to use this for both create and update
    );

    return user;
  } catch (error) {
    console.log("Error creating or updating user:", error);
  }
}

export async function deleteUser(id) {
  try {
    await Connect();

    await User.findOneAndDelete({ clerkId: id });
    return "User deleted successfully";
  } catch (error) {
    console.log("Error deleting user.", error);
  }
}
