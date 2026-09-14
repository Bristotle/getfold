/**
 * The payment methods a church can pay with, drawn rather than written.
 *
 * These were text pills and read as a list of words nobody looks at. A row
 * of marks is recognised before it is read, which is the whole point of
 * putting it under a price.
 *
 * DRAWN HERE, NOT DOWNLOADED. Each one is an inline SVG using the brand's
 * own colours, so there is no network request, nothing to go stale, nothing
 * to break on a weak connection, and no third party watching who looks at
 * our pricing page. They are faithful in colour and shape but they are not
 * the official artwork: MTN, Telecel, AirtelTigo, Visa, Mastercard and
 * Paystack each publish a brand kit, and if we ever want exactness those
 * files drop in behind the same components.
 *
 * Displaying a payment mark to say "we accept this" is ordinary and
 * permitted. Using one to imply endorsement is not, so none of them is
 * larger or more prominent than our own copy.
 */

/** One consistent height for every mark, so the row reads as a row. */
const H = 22;

function Mark({
  label,
  width,
  children,
}: {
  label: string;
  width: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center">
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} 24`}
        height={H}
        width={(width / 24) * H}
        className="block"
      >
        <title>{label}</title>
        {children}
      </svg>
    </li>
  );
}

export function PaymentMarks() {
  return (
    <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-3 p-0">
      {/* MTN MoMo. Yellow ground, black wordmark. */}
      <Mark label="MTN Mobile Money" width={58}>
        <rect width="58" height="24" rx="5" fill="#FFCC00" />
        <text
          x="29"
          y="16.5"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill="#000"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.5"
        >
          MTN
        </text>
      </Mark>

      {/* Telecel Cash. */}
      <Mark label="Telecel Cash" width={72}>
        <rect width="72" height="24" rx="5" fill="#E4002B" />
        <text
          x="36"
          y="16.5"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
        >
          Telecel
        </text>
      </Mark>

      {/* AirtelTigo Money. Airtel's red beside Tigo's blue. */}
      <Mark label="AirtelTigo Money" width={84}>
        <rect width="84" height="24" rx="5" fill="#ED1C24" />
        <path d="M42 0h37a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H42z" fill="#0A3D91" />
        <text
          x="21"
          y="16.5"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
        >
          Airtel
        </text>
        <text
          x="63"
          y="16.5"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
        >
          Tigo
        </text>
      </Mark>

      {/* Visa. The wordmark is italic, which is most of what makes it Visa. */}
      <Mark label="Visa" width={58}>
        <rect width="58" height="24" rx="5" fill="#fff" stroke="#e7e2da" />
        <text
          x="29"
          y="17"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fontStyle="italic"
          fill="#1434CB"
          fontFamily="system-ui, sans-serif"
          letterSpacing="-0.3"
        >
          VISA
        </text>
      </Mark>

      {/* Mastercard. Two circles, overlapping, which is the whole mark. */}
      <Mark label="Mastercard" width={44}>
        <rect width="44" height="24" rx="5" fill="#fff" stroke="#e7e2da" />
        <circle cx="18" cy="12" r="7" fill="#EB001B" />
        <circle cx="26" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9" />
      </Mark>

      {/* Bank transfer. Ours, not a brand, so it stays quiet and neutral. */}
      <Mark label="Bank transfer" width={78}>
        <rect width="78" height="24" rx="5" fill="#fff" stroke="#e7e2da" />
        <path
          d="M14 10.5 20 7l6 3.5M15.5 11v5.5M20 11v5.5M24.5 11v5.5M13.5 17.5h13"
          stroke="#6b6478"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        <text
          x="52"
          y="16.5"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="600"
          fill="#6b6478"
          fontFamily="system-ui, sans-serif"
        >
          Bank
        </text>
      </Mark>
    </ul>
  );
}

/** The Paystack mark, for "payments secured by". */
export function PaystackMark() {
  return (
    <svg
      role="img"
      aria-label="Paystack"
      viewBox="0 0 80 24"
      height={18}
      width={60}
      className="block"
    >
      <title>Paystack</title>
      {/* Their mark is a stack of bars, the last one short. */}
      <g fill="#00C3F7">
        <rect x="0" y="4" width="14" height="3.2" rx="1.2" />
        <rect x="0" y="9" width="14" height="3.2" rx="1.2" />
        <rect x="0" y="14" width="14" height="3.2" rx="1.2" />
        <rect x="0" y="19" width="8" height="3.2" rx="1.2" />
      </g>
      <text
        x="20"
        y="17"
        fontSize="12"
        fontWeight="700"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
      >
        Paystack
      </text>
    </svg>
  );
}
