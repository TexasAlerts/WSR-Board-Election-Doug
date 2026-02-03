/**
 * USPS Address Validation using USPS Web Tools API
 * Requires USPS_USER_ID environment variable
 * Register at: https://www.usps.com/business/web-tools-apis/
 */

const USPS_API_URL = 'https://secure.shippingapis.com/ShippingAPI.dll';

/**
 * Validate and standardize an address using USPS API
 * @param {Object} address
 * @param {string} address.street - Street address (e.g., "123 Main St")
 * @param {string} address.city - City name
 * @param {string} address.state - State abbreviation (e.g., "TX")
 * @param {string} address.zip - ZIP code (5 or 9 digit)
 * @returns {Promise<{ valid: boolean, standardized: Object | null, error: string | null }>}
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
    const response = await fetch(`${USPS_API_URL}?API=Verify&XML=${encodeURIComponent(xml)}`, {
      method: 'GET',
    });

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
    const isDeliverable =
      dpvConfirmation === 'Y' || dpvConfirmation === 'D' || dpvConfirmation === 'S';

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
 * Escape special characters for XML
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
 * Extract value from XML tag
 */
function extractXmlValue(xml, tag) {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Check if ZIP code is in Prosper, TX area
 * This is a simple check for nearby ZIP codes
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
