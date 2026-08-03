import { Seller } from "../models/Seller.js";

// 1. Create or Update Seller Profile
export const registerSeller = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      businessName, ownerName, phone, businessType, 
      gstNumber, panNumber, 
      addressType, addressLine1, addressLine2, city, state, postalCode 
    } = req.body;

    if (!businessName || !ownerName || !phone || !businessType) {
      return res.status(400).json({
        success: false,
        message: "Business name, owner name, phone, and business type are required.",
      });
    }

    // Check if seller profile already exists
    let seller = await Seller.findOne({ authUserId: userId });

    if (seller) {
      // Update existing
      seller.businessName = businessName;
      seller.ownerName = ownerName;
      seller.phone = phone;
      seller.businessType = businessType;
      seller.gstNumber = gstNumber || seller.gstNumber;
      seller.panNumber = panNumber || seller.panNumber;
      // Note: Seller Address logic can be handled separately or added to the Seller model if we extend it.
      await seller.save();

      return res.status(200).json({
        success: true,
        message: "Seller profile updated successfully.",
        seller,
      });
    }

    // Create new
    seller = new Seller({
      authUserId: userId,
      email: req.user.email,
      businessName,
      ownerName,
      phone,
      businessType,
      gstNumber: gstNumber || "",
      panNumber: panNumber || "",
    });

    await seller.save();

    return res.status(201).json({
      success: true,
      message: "Seller profile created successfully.",
      seller,
    });
  } catch (error) {
    console.error("Register Seller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// 2. Get Seller Profile
export const getSellerProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const seller = await Seller.findOne({ authUserId: userId });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    console.error("Get Seller Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
