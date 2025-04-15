// utils/profileUtils.js (or inside your controller file)

const HostModel = require("../models/hostModel");
const VendorModel = require("../models/vendorModel");

const CreateHostProfile = (profileData, phone_no) => {
    const {
      first_name,
      last_name,
      country,
      event_type,
      estimated_guests,
      event_budget,
    } = profileData;
    return new HostModel({
      first_name,
      last_name,
      phone_no,
      country,
      event_type,
      estimated_guests,
      event_budget,
    });
  };
  
  const CreateVendorProfile = (profileData, phone_no) => {
    const {
      first_name,
      last_name,
      category,
      country,
      business_registration,
      business_license_number,
      business_license_doc,
      street,
      city,
      state,
      postal_code,
      website,
      social_links,
      business_type,
      tax_id_number,
      years_of_experience,
    } = profileData;
  
    if (
      !first_name || !category || !country || !business_license_number || !business_registration ||
      !tax_id_number || !street || !city || !state || !postal_code
    ) {
      return { error: "All fields are required" };
    }
    return new VendorModel({
      first_name,
      last_name,
      phone_no,
      country,
      category,
      business_registration,
      business_license_number,
      business_license_doc,
      street,
      city,
      state,
      postal_code,
      website,
      social_links,
      business_type,
      tax_id_number,
      years_of_experience,
    });
  };
  

  module.exports={CreateHostProfile,CreateVendorProfile}
  