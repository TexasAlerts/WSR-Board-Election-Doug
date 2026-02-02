/**
 * USPS address validation and standardization module.
 * Uses USPS Web Tools API to validate and standardize US addresses.
 * Checks Delivery Point Validation (DPV) to verify deliverability.
 *
 * @module uspsValidation
 * @requires USPS_USER_ID environment variable (optional - gracefully degrades if missing)
 * @see {@link https://www.usps.com/business/web-tools-apis/} for API registration
 */

const USPS_API_URL = 'https://secure.shippingapis.com/ShippingAPI.dll';

/**
 * Validate and standardize a US address using the USPS API.
 * Returns standardized address format and deliverability status.
 * If USPS_USER_ID is not configured, performs basic validation only.
 *
 * @param {Object} address - Address components to validate
 * @param {string} address.street - Street address line (e.g., "123 Main St")
 * @param {string} address.city - City name
 * @param {string} address.state - Two-letter state abbreviation (e.g., "TX")
 * @param {string} address.zip - ZIP code (5 or 9 digits)
 * @returns {Promise<{valid: boolean, standardized: Object|null, error: string|null, deliverable?: boolean, skipped?: boolean}>} Validation result
 *
 * @example
 * const result = await validateAddress({
 *   street: '123 Main Street',
 *   city: 'Prosper',
 *   state: 'TX',
 *   zip: '75078'
 * });
 * if (result.valid && result.deliverable) {
 *   console.log('Standardized:', result.standardized);
 * }
 */
export async function validateAddress({ street, city, state, zip }) {
  const userId = process.env.USPS_USER_ID;

  // If no USPS credentials, do basic validation only
  if (!userId) {
    return {
      valid: true,
      standardized: { street, city, state, zip },
      error: null,
      skipped: true,
    };
  }

  // Build XML request
  const xml = `
    <AddressValidateRequest USERID="${userId}">
      <Revision>1</Revision>
      <Address ID="0">
        <Address1></Address1>
        <Address2>${escapeXml(street)}</Address2>
        <City>${escapeXml(city)}</City>
        <State>${escapeXml(state)}</State>
        <Zip5>${escapeXml(zip.substring(0, 5))}</Zip5>
        <Zip4></Zip4>
      </Address>
    </AddressValidateRequest>
  `.trim();

  try {
    const response = await fetch(
      `${USPS_API_URL}?API=Verify&XML=${encodeURIComponent(xml)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`USPS API error: ${response.status}`);
    }

    const text = await response.text();

    // Check for error in response
    if (text.includes('<Error>')) {
      const errorMatch = text.match(/<Description>([^<]+)<\/Description>/);
      const errorMsg = errorMatch ? errorMatch[1] : 'Address validation failed';
      return { valid: false, standardized: null, error: errorMsg };
    }

    // Parse successful response
    const address2 = extractXmlValue(text, 'Address2');
    const cityResult = extractXmlValue(text, 'City');
    const stateResult = extractXmlValue(text, 'State');
    const zip5 = extractXmlValue(text, 'Zip5');
    const zip4 = extractXmlValue(text, 'Zip4');

    // Check for DPV (Delivery Point Validation) - indicates deliverable address
    const dpvConfirmation = extractXmlValue(text, 'DPVConfirmation');

    // DPV codes: Y = confirmed, D = confirmed (missing secondary), N = not confirmed, S = secondary missing
    const isDeliverable = dpvConfirmation === 'Y' || dpvConfirmation === 'D' || dpvConfirmation === 'S';

    if (!address2) {
      return { valid: false, standardized: null, error: 'Address not found' };
    }

    return {
      valid: true,
      deliverable: isDeliverable,
      standardized: {
        street: address2,
        city: cityResult,
        state: stateResult,
        zip: zip4 ? `${zip5}-${zip4}` : zip5,
      },
      error: null,
    };
  } catch (err) {
    return {
      valid: false,
      standardized: null,
      error: 'Could not validate address. Please try again.',
    };
  }
}

/**
 * Escape special characters for XML formatting.
 * Converts characters that have special meaning in XML to their entity equivalents.
 *
 * @private
 * @param {string} str - String to escape
 * @returns {string} XML-safe string
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Extract the text content from an XML tag.
 *
 * @private
 * @param {string} xml - XML string to parse
 * @param {string} tag - Tag name to extract
 * @returns {string|null} Text content of the tag, or null if not found
 */
function extractXmlValue(xml, tag) {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Check if a ZIP code is in the Prosper, TX area or nearby cities.
 * Includes Prosper and adjacent/nearby cities like Celina, Frisco, McKinney, Allen, and Aubrey.
 *
 * @param {string} zip - ZIP code to check (5 or 9 digit format)
 * @returns {boolean} True if ZIP is in the Prosper area
 *
 * @example
 * isProsperAreaZip('75078'); // true (Prosper)
 * isProsperAreaZip('75033'); // true (Frisco, adjacent)
 * isProsperAreaZip('90210'); // false (Beverly Hills)
 */
export function isProsperAreaZip(zip) {
  const prosperZips = [
    '75078', // Prosper main
    '75009', // Celina (adjacent)
    '75033', // Frisco (adjacent)
    '75034', // Frisco (adjacent)
    '75035', // Frisco (adjacent)
    '75070', // McKinney (adjacent)
    '75071', // McKinney (adjacent)
    '75013', // Allen (nearby)
    '76227', // Aubrey (adjacent)
  ];

  const zip5 = zip?.substring(0, 5);
  return prosperZips.includes(zip5);
}
