import { UserProfile } from "../models/UserProfile.js";
import { cloudinary } from "../config/cloudinary.js";

// 1. Get Profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 2. Update Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, bio } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    if (fullName !== undefined) profile.fullName = fullName;
    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 3. Delete Profile
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await UserProfile.findOneAndDelete({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    // Delete image from Cloudinary if exists
    if (profile.profileImage?.publicId) {
      await cloudinary.uploader.destroy(profile.profileImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 4. Upload Profile Image via Cloudinary
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided.",
      });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    // Delete old image if present
    if (profile.profileImage?.publicId) {
      await cloudinary.uploader.destroy(profile.profileImage.publicId);
    }

    // Upload new image buffer to Cloudinary
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "localmart/profiles" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await uploadStream();

    profile.profileImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully.",
      profileImage: profile.profileImage,
    });
  } catch (error) {
    console.error("Upload Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during image upload.",
    });
  }
};

// 5. Manage Addresses (Add, Get, Update, Delete)
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { street, city, state, postalCode, country, isDefault } = req.body;

    if (!street || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: "Street, city, state, and postal code are required.",
      });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    if (isDefault) {
      profile.addresses.forEach((addr) => (addr.isDefault = false));
    }

    profile.addresses.push({
      street,
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: isDefault || profile.addresses.length === 0,
    });

    await profile.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      addresses: profile.addresses,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const { street, city, state, postalCode, country, isDefault } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const address = profile.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    if (isDefault) {
      profile.addresses.forEach((addr) => (addr.isDefault = false));
    }

    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      addresses: profile.addresses,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    profile.addresses.pull(addressId);
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
      addresses: profile.addresses,
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
