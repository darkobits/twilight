/**
 * Default TwiML to generate if an action can't be found.
 */
export const DEFAULT_ACTION = 'hangUp';


/**
 * Timeout used for <Gather> (user input), forwarding calls, etc.
 */
export const DEFAULT_TIMEOUT = 5;


/**
 * Default HTTP method to use when registering routes.
 */
export const DEFAULT_METHOD = 'GET';


/**
 * HTTP methods supported by Twilio.
 */
export const TWILIO_HTTP_METHODS = ['GET', 'POST'];


/**
 * Languages supported by Twilio.
 */
export const LANGUAGES = [{
  language: 'Afrikaans (South Africa)',
  tag: 'af-ZA'
}, {
  language: 'Amharic (Ethiopia)',
  tag: 'am-ET'
}, {
  language: 'Armenian (Armenia)',
  tag: 'hy-AM'
}, {
  language: 'Azerbaijani (Azerbaijani)',
  tag: 'az-AZ'
}, {
  language: 'Indonesian (Indonesia)',
  tag: 'id-ID'
}, {
  language: 'Malay (Malaysia)',
  tag: 'ms-MY'
}, {
  language: 'Bengali (Bangladesh)',
  tag: 'bn-BD'
}, {
  language: 'Bengali (India)',
  tag: 'bn-IN'
}, {
  language: 'Catalan (Spain)',
  tag: 'ca-ES'
}, {
  language: 'Czech (Czech Republic)',
  tag: 'cs-CZ'
}, {
  language: 'Danish (Denmark)',
  tag: 'da-DK'
}, {
  language: 'German (Germany)',
  tag: 'de-DE'
}, {
  language: 'English (Australia)',
  tag: 'en-AU'
}, {
  language: 'English (Canada)',
  tag: 'en-CA'
}, {
  language: 'English (Ghana)',
  tag: 'en-GH'
}, {
  language: 'English (United Kingdom)',
  tag: 'en-GB'
}, {
  language: 'English (India)',
  tag: 'en-IN'
}, {
  language: 'English (Ireland)',
  tag: 'en-IE'
}, {
  language: 'English (Kenya)',
  tag: 'en-KE'
}, {
  language: 'English (New Zealand)',
  tag: 'en-NZ'
}, {
  language: 'English (Nigeria)',
  tag: 'en-NG'
}, {
  language: 'English (Philippines)',
  tag: 'en-PH'
}, {
  language: 'English (South Africa)',
  tag: 'en-ZA'
}, {
  language: 'English (Tanzania)',
  tag: 'en-TZ'
}, {
  language: 'English (United States)',
  tag: 'en-US'
}, {
  language: 'Spanish (Argentina)',
  tag: 'es-AR'
}, {
  language: 'Spanish (Bolivia)',
  tag: 'es-BO'
}, {
  language: 'Spanish (Chile)',
  tag: 'es-CL'
}, {
  language: 'Spanish (Colombia)',
  tag: 'es-CO'
}, {
  language: 'Spanish (Costa Rica)',
  tag: 'es-CR'
}, {
  language: 'Spanish (Ecuador)',
  tag: 'es-EC'
}, {
  language: 'Spanish (El Salvador)',
  tag: 'es-SV'
}, {
  language: 'Spanish (Spain)',
  tag: 'es-ES'
}, {
  language: 'Spanish (United States)',
  tag: 'es-US'
}, {
  language: 'Spanish (Guatemala)',
  tag: 'es-GT'
}, {
  language: 'Spanish (Honduras)',
  tag: 'es-HN'
}, {
  language: 'Spanish (Mexico)',
  tag: 'es-MX'
}, {
  language: 'Spanish (Nicaragua)',
  tag: 'es-NI'
}, {
  language: 'Spanish (Panama)',
  tag: 'es-PA'
}, {
  language: 'Spanish (Paraguay)',
  tag: 'es-PY'
}, {
  language: 'Spanish (Peru)',
  tag: 'es-PE'
}, {
  language: 'Spanish (Puerto Rico)',
  tag: 'es-PR'
}, {
  language: 'Spanish (Dominican Republic)',
  tag: 'es-DO'
}, {
  language: 'Spanish (Uruguay)',
  tag: 'es-UY'
}, {
  language: 'Spanish (Venezuela)',
  tag: 'es-VE'
}, {
  language: 'Basque (Spain)',
  tag: 'eu-ES'
}, {
  language: 'Filipino (Philippines) f',
  tag: 'il-PH'
}, {
  language: 'French (Canada)',
  tag: 'fr-CA'
}, {
  language: 'French (France)',
  tag: 'fr-FR'
}, {
  language: 'Galician (Spain)',
  tag: 'gl-ES'
}, {
  language: 'Georgian (Georgia)',
  tag: 'ka-GE'
}, {
  language: 'Gujarati (India)',
  tag: 'gu-IN'
}, {
  language: 'Croatian (Croatia)',
  tag: 'hr-HR'
}, {
  language: 'Zulu (South Africa)',
  tag: 'zu-ZA'
}, {
  language: 'Icelandic (Iceland)',
  tag: 'is-IS'
}, {
  language: 'Italian (Italy)',
  tag: 'it-IT'
}, {
  language: 'Javanese (Indonesia)',
  tag: 'jv-ID'
}, {
  language: 'Kannada (India)',
  tag: 'kn-IN'
}, {
  language: 'Khmer (Cambodian)',
  tag: 'km-KH'
}, {
  language: 'Lao (Laos)',
  tag: 'lo-LA'
}, {
  language: 'Latvian (Latvia)',
  tag: 'lv-LV'
}, {
  language: 'Lithuanian (Lithuania)',
  tag: 'lt-LT'
}, {
  language: 'Hungarian (Hungary)',
  tag: 'hu-HU'
}, {
  language: 'Malayalam (India)',
  tag: 'ml-IN'
}, {
  language: 'Marathi (India)',
  tag: 'mr-IN'
}, {
  language: 'Dutch (Netherlands)',
  tag: 'nl-NL'
}, {
  language: 'Nepali (Nepal)',
  tag: 'ne-NP'
}, {
  language: 'Norwegian Bokmål (Norway)',
  tag: 'nb-NO'
}, {
  language: 'Polish (Poland)',
  tag: 'pl-PL'
}, {
  language: 'Portuguese (Brazil)',
  tag: 'pt-BR'
}, {
  language: 'Portuguese (Portugal)',
  tag: 'pt-PT'
}, {
  language: 'Romanian (Romania)',
  tag: 'ro-RO'
}, {
  language: 'Sinhala (Sri Lanka)',
  tag: 'si-LK'
}, {
  language: 'Slovak (Slovakia)',
  tag: 'sk-SK'
}, {
  language: 'Slovenian (Slovenia)',
  tag: 'sl-SI'
}, {
  language: 'Sundanese (Indonesia)',
  tag: 'su-ID'
}, {
  language: 'Swahili (Tanzania)',
  tag: 'sw-TZ'
}, {
  language: 'Swahili (Kenya)',
  tag: 'sw-KE'
}, {
  language: 'Finnish (Finland)',
  tag: 'fi-FI'
}, {
  language: 'Swedish (Sweden)',
  tag: 'sv-SE'
}, {
  language: 'Tamil (India)',
  tag: 'ta-IN'
}, {
  language: 'Tamil (Singapore)',
  tag: 'ta-SG'
}, {
  language: 'Tamil (Sri Lanka)',
  tag: 'ta-LK'
}, {
  language: 'Tamil (Malaysia)',
  tag: 'ta-MY'
}, {
  language: 'Telugu (India)',
  tag: 'te-IN'
}, {
  language: 'Vietnamese (Vietnam)',
  tag: 'vi-VN'
}, {
  language: 'Turkish (Turkey)',
  tag: 'tr-TR'
}, {
  language: 'Urdu (Pakistan)',
  tag: 'ur-PK'
}, {
  language: 'Urdu (India)',
  tag: 'ur-IN'
}, {
  language: 'Greek (Greece)',
  tag: 'el-GR'
}, {
  language: 'Bulgarian (Bulgaria)',
  tag: 'bg-BG'
}, {
  language: 'Russian (Russia)',
  tag: 'ru-RU'
}, {
  language: 'Serbian (Serbia)',
  tag: 'sr-RS'
}, {
  language: 'Ukrainian (Ukraine)',
  tag: 'uk-UA'
}, {
  language: 'Hebrew (Israel)',
  tag: 'he-IL'
}, {
  language: 'Arabic (Israel)',
  tag: 'ar-IL'
}, {
  language: 'Arabic (Jordan)',
  tag: 'ar-JO'
}, {
  language: 'Arabic (United Arab Emirates)',
  tag: 'ar-AE'
}, {
  language: 'Arabic (Bahrain)',
  tag: 'ar-BH'
}, {
  language: 'Arabic (Algeria)',
  tag: 'ar-DZ'
}, {
  language: 'Arabic (Saudi Arabia)',
  tag: 'ar-SA'
}, {
  language: 'Arabic (Iraq)',
  tag: 'ar-IQ'
}, {
  language: 'Arabic (Kuwait)',
  tag: 'ar-KW'
}, {
  language: 'Arabic (Morocco)',
  tag: 'ar-MA'
}, {
  language: 'Arabic (Tunisia)',
  tag: 'ar-TN'
}, {
  language: 'Arabic (Oman)',
  tag: 'ar-OM'
}, {
  language: 'Arabic (State of Palestine)',
  tag: 'ar-PS'
}, {
  language: 'Arabic (Qatar)',
  tag: 'ar-QA'
}, {
  language: 'Arabic (Lebanon)',
  tag: 'ar-LB'
}, {
  language: 'Arabic (Egypt)',
  tag: 'ar-EG'
}, {
  language: 'Persian (Iran)',
  tag: 'fa-IR'
}, {
  language: 'Hindi (India)',
  tag: 'hi-IN'
}, {
  language: 'Thai (Thailand)',
  tag: 'th-TH'
}, {
  language: 'Korean (South Korea)',
  tag: 'ko-KR'
}, {
  language: 'Chinese, Mandarin (Traditional, Taiwan)',
  tag: 'cmn-Hant-TW'
}, {
  language: 'Chinese, Cantonese (Traditional, Hong Kong)',
  tag: 'yue-Hant-HK'
}, {
  language: 'Japanese (Japan)',
  tag: 'ja-JP'
}, {
  language: 'Chinese, Mandarin (Simplified, Hong Kong)',
  tag: 'cmn-Hans-HK'
}, {
  language: 'Chinese, Mandarin (Simplified, China)',
  tag: 'cmn-Hans-CN'
}];


/**
 * List of ISO-3601 alpha-2 country names and codes.
 */
export const COUNTRIES = [{
  code: 'AF',
  name: 'Afghanistan'
}, {
  code: 'AX',
  name: 'Aland Islands'
}, {
  code: 'AL',
  name: 'Albania'
}, {
  code: 'DZ',
  name: 'Algeria'
}, {
  code: 'AS',
  name: 'American Samoa'
}, {
  code: 'AD',
  name: 'Andorra'
}, {
  code: 'AO',
  name: 'Angola'
}, {
  code: 'AI',
  name: 'Anguilla'
}, {
  code: 'AQ',
  name: 'Antarctica'
}, {
  code: 'AG',
  name: 'Antigua And Barbuda'
}, {
  code: 'AR',
  name: 'Argentina'
}, {
  code: 'AM',
  name: 'Armenia'
}, {
  code: 'AW',
  name: 'Aruba'
}, {
  code: 'AU',
  name: 'Australia'
}, {
  code: 'AT',
  name: 'Austria'
}, {
  code: 'AZ',
  name: 'Azerbaijan'
}, {
  code: 'BS',
  name: 'Bahamas'
}, {
  code: 'BH',
  name: 'Bahrain'
}, {
  code: 'BD',
  name: 'Bangladesh'
}, {
  code: 'BB',
  name: 'Barbados'
}, {
  code: 'BY',
  name: 'Belarus'
}, {
  code: 'BE',
  name: 'Belgium'
}, {
  code: 'BZ',
  name: 'Belize'
}, {
  code: 'BJ',
  name: 'Benin'
}, {
  code: 'BM',
  name: 'Bermuda'
}, {
  code: 'BT',
  name: 'Bhutan'
}, {
  code: 'BO',
  name: 'Bolivia'
}, {
  code: 'BA',
  name: 'Bosnia And Herzegovina'
}, {
  code: 'BW',
  name: 'Botswana'
}, {
  code: 'BV',
  name: 'Bouvet Island'
}, {
  code: 'BR',
  name: 'Brazil'
}, {
  code: 'IO',
  name: 'British Indian Ocean Territory'
}, {
  code: 'BN',
  name: 'Brunei Darussalam'
}, {
  code: 'BG',
  name: 'Bulgaria'
}, {
  code: 'BF',
  name: 'Burkina Faso'
}, {
  code: 'BI',
  name: 'Burundi'
}, {
  code: 'KH',
  name: 'Cambodia'
}, {
  code: 'CM',
  name: 'Cameroon'
}, {
  code: 'CA',
  name: 'Canada'
}, {
  code: 'CV',
  name: 'Cape Verde'
}, {
  code: 'KY',
  name: 'Cayman Islands'
}, {
  code: 'CF',
  name: 'Central African Republic'
}, {
  code: 'TD',
  name: 'Chad'
}, {
  code: 'CL',
  name: 'Chile'
}, {
  code: 'CN',
  name: 'China'
}, {
  code: 'CX',
  name: 'Christmas Island'
}, {
  code: 'CC',
  name: 'Cocos (Keeling) Islands'
}, {
  code: 'CO',
  name: 'Colombia'
}, {
  code: 'KM',
  name: 'Comoros'
}, {
  code: 'CG',
  name: 'Congo'
}, {
  code: 'CD',
  name: 'Congo, Democratic Republic'
}, {
  code: 'CK',
  name: 'Cook Islands'
}, {
  code: 'CR',
  name: 'Costa Rica'
}, {
  code: 'CI',
  name: 'Cote D\'Ivoire'
}, {
  code: 'HR',
  name: 'Croatia'
}, {
  code: 'CU',
  name: 'Cuba'
}, {
  code: 'CY',
  name: 'Cyprus'
}, {
  code: 'CZ',
  name: 'Czech Republic'
}, {
  code: 'DK',
  name: 'Denmark'
}, {
  code: 'DJ',
  name: 'Djibouti'
}, {
  code: 'DM',
  name: 'Dominica'
}, {
  code: 'DO',
  name: 'Dominican Republic'
}, {
  code: 'EC',
  name: 'Ecuador'
}, {
  code: 'EG',
  name: 'Egypt'
}, {
  code: 'SV',
  name: 'El Salvador'
}, {
  code: 'GQ',
  name: 'Equatorial Guinea'
}, {
  code: 'ER',
  name: 'Eritrea'
}, {
  code: 'EE',
  name: 'Estonia'
}, {
  code: 'ET',
  name: 'Ethiopia'
}, {
  code: 'FK',
  name: 'Falkland Islands (Malvinas)'
}, {
  code: 'FO',
  name: 'Faroe Islands'
}, {
  code: 'FJ',
  name: 'Fiji'
}, {
  code: 'FI',
  name: 'Finland'
}, {
  code: 'FR',
  name: 'France'
}, {
  code: 'GF',
  name: 'French Guiana'
}, {
  code: 'PF',
  name: 'French Polynesia'
}, {
  code: 'TF',
  name: 'French Southern Territories'
}, {
  code: 'GA',
  name: 'Gabon'
}, {
  code: 'GM',
  name: 'Gambia'
}, {
  code: 'GE',
  name: 'Georgia'
}, {
  code: 'DE',
  name: 'Germany'
}, {
  code: 'GH',
  name: 'Ghana'
}, {
  code: 'GI',
  name: 'Gibraltar'
}, {
  code: 'GR',
  name: 'Greece'
}, {
  code: 'GL',
  name: 'Greenland'
}, {
  code: 'GD',
  name: 'Grenada'
}, {
  code: 'GP',
  name: 'Guadeloupe'
}, {
  code: 'GU',
  name: 'Guam'
}, {
  code: 'GT',
  name: 'Guatemala'
}, {
  code: 'GG',
  name: 'Guernsey'
}, {
  code: 'GN',
  name: 'Guinea'
}, {
  code: 'GW',
  name: 'Guinea-Bissau'
}, {
  code: 'GY',
  name: 'Guyana'
}, {
  code: 'HT',
  name: 'Haiti'
}, {
  code: 'HM',
  name: 'Heard Island & Mcdonald Islands'
}, {
  code: 'VA',
  name: 'Holy See (Vatican City State)'
}, {
  code: 'HN',
  name: 'Honduras'
}, {
  code: 'HK',
  name: 'Hong Kong'
}, {
  code: 'HU',
  name: 'Hungary'
}, {
  code: 'IS',
  name: 'Iceland'
}, {
  code: 'IN',
  name: 'India'
}, {
  code: 'ID',
  name: 'Indonesia'
}, {
  code: 'IR',
  name: 'Iran, Islamic Republic Of'
}, {
  code: 'IQ',
  name: 'Iraq'
}, {
  code: 'IE',
  name: 'Ireland'
}, {
  code: 'IM',
  name: 'Isle Of Man'
}, {
  code: 'IL',
  name: 'Israel'
}, {
  code: 'IT',
  name: 'Italy'
}, {
  code: 'JM',
  name: 'Jamaica'
}, {
  code: 'JP',
  name: 'Japan'
}, {
  code: 'JE',
  name: 'Jersey'
}, {
  code: 'JO',
  name: 'Jordan'
}, {
  code: 'KZ',
  name: 'Kazakhstan'
}, {
  code: 'KE',
  name: 'Kenya'
}, {
  code: 'KI',
  name: 'Kiribati'
}, {
  code: 'KR',
  name: 'Korea'
}, {
  code: 'KW',
  name: 'Kuwait'
}, {
  code: 'KG',
  name: 'Kyrgyzstan'
}, {
  code: 'LA',
  name: 'Lao People\'s Democratic Republic'
}, {
  code: 'LV',
  name: 'Latvia'
}, {
  code: 'LB',
  name: 'Lebanon'
}, {
  code: 'LS',
  name: 'Lesotho'
}, {
  code: 'LR',
  name: 'Liberia'
}, {
  code: 'LY',
  name: 'Libyan Arab Jamahiriya'
}, {
  code: 'LI',
  name: 'Liechtenstein'
}, {
  code: 'LT',
  name: 'Lithuania'
}, {
  code: 'LU',
  name: 'Luxembourg'
}, {
  code: 'MO',
  name: 'Macao'
}, {
  code: 'MK',
  name: 'Macedonia'
}, {
  code: 'MG',
  name: 'Madagascar'
}, {
  code: 'MW',
  name: 'Malawi'
}, {
  code: 'MY',
  name: 'Malaysia'
}, {
  code: 'MV',
  name: 'Maldives'
}, {
  code: 'ML',
  name: 'Mali'
}, {
  code: 'MT',
  name: 'Malta'
}, {
  code: 'MH',
  name: 'Marshall Islands'
}, {
  code: 'MQ',
  name: 'Martinique'
}, {
  code: 'MR',
  name: 'Mauritania'
}, {
  code: 'MU',
  name: 'Mauritius'
}, {
  code: 'YT',
  name: 'Mayotte'
}, {
  code: 'MX',
  name: 'Mexico'
}, {
  code: 'FM',
  name: 'Micronesia, Federated States Of'
}, {
  code: 'MD',
  name: 'Moldova'
}, {
  code: 'MC',
  name: 'Monaco'
}, {
  code: 'MN',
  name: 'Mongolia'
}, {
  code: 'ME',
  name: 'Montenegro'
}, {
  code: 'MS',
  name: 'Montserrat'
}, {
  code: 'MA',
  name: 'Morocco'
}, {
  code: 'MZ',
  name: 'Mozambique'
}, {
  code: 'MM',
  name: 'Myanmar'
}, {
  code: 'NA',
  name: 'Namibia'
}, {
  code: 'NR',
  name: 'Nauru'
}, {
  code: 'NP',
  name: 'Nepal'
}, {
  code: 'NL',
  name: 'Netherlands'
}, {
  code: 'AN',
  name: 'Netherlands Antilles'
}, {
  code: 'NC',
  name: 'New Caledonia'
}, {
  code: 'NZ',
  name: 'New Zealand'
}, {
  code: 'NI',
  name: 'Nicaragua'
}, {
  code: 'NE',
  name: 'Niger'
}, {
  code: 'NG',
  name: 'Nigeria'
}, {
  code: 'NU',
  name: 'Niue'
}, {
  code: 'NF',
  name: 'Norfolk Island'
}, {
  code: 'MP',
  name: 'Northern Mariana Islands'
}, {
  code: 'NO',
  name: 'Norway'
}, {
  code: 'OM',
  name: 'Oman'
}, {
  code: 'PK',
  name: 'Pakistan'
}, {
  code: 'PW',
  name: 'Palau'
}, {
  code: 'PS',
  name: 'Palestinian Territory, Occupied'
}, {
  code: 'PA',
  name: 'Panama'
}, {
  code: 'PG',
  name: 'Papua New Guinea'
}, {
  code: 'PY',
  name: 'Paraguay'
}, {
  code: 'PE',
  name: 'Peru'
}, {
  code: 'PH',
  name: 'Philippines'
}, {
  code: 'PN',
  name: 'Pitcairn'
}, {
  code: 'PL',
  name: 'Poland'
}, {
  code: 'PT',
  name: 'Portugal'
}, {
  code: 'PR',
  name: 'Puerto Rico'
}, {
  code: 'QA',
  name: 'Qatar'
}, {
  code: 'RE',
  name: 'Reunion'
}, {
  code: 'RO',
  name: 'Romania'
}, {
  code: 'RU',
  name: 'Russian Federation'
}, {
  code: 'RW',
  name: 'Rwanda'
}, {
  code: 'BL',
  name: 'Saint Barthelemy'
}, {
  code: 'SH',
  name: 'Saint Helena'
}, {
  code: 'KN',
  name: 'Saint Kitts And Nevis'
}, {
  code: 'LC',
  name: 'Saint Lucia'
}, {
  code: 'MF',
  name: 'Saint Martin'
}, {
  code: 'PM',
  name: 'Saint Pierre And Miquelon'
}, {
  code: 'VC',
  name: 'Saint Vincent And Grenadines'
}, {
  code: 'WS',
  name: 'Samoa'
}, {
  code: 'SM',
  name: 'San Marino'
}, {
  code: 'ST',
  name: 'Sao Tome And Principe'
}, {
  code: 'SA',
  name: 'Saudi Arabia'
}, {
  code: 'SN',
  name: 'Senegal'
}, {
  code: 'RS',
  name: 'Serbia'
}, {
  code: 'SC',
  name: 'Seychelles'
}, {
  code: 'SL',
  name: 'Sierra Leone'
}, {
  code: 'SG',
  name: 'Singapore'
}, {
  code: 'SK',
  name: 'Slovakia'
}, {
  code: 'SI',
  name: 'Slovenia'
}, {
  code: 'SB',
  name: 'Solomon Islands'
}, {
  code: 'SO',
  name: 'Somalia'
}, {
  code: 'ZA',
  name: 'South Africa'
}, {
  code: 'GS',
  name: 'South Georgia And Sandwich Isl.'
}, {
  code: 'ES',
  name: 'Spain'
}, {
  code: 'LK',
  name: 'Sri Lanka'
}, {
  code: 'SD',
  name: 'Sudan'
}, {
  code: 'SR',
  name: 'Suriname'
}, {
  code: 'SJ',
  name: 'Svalbard And Jan Mayen'
}, {
  code: 'SZ',
  name: 'Swaziland'
}, {
  code: 'SE',
  name: 'Sweden'
}, {
  code: 'CH',
  name: 'Switzerland'
}, {
  code: 'SY',
  name: 'Syrian Arab Republic'
}, {
  code: 'TW',
  name: 'Taiwan'
}, {
  code: 'TJ',
  name: 'Tajikistan'
}, {
  code: 'TZ',
  name: 'Tanzania'
}, {
  code: 'TH',
  name: 'Thailand'
}, {
  code: 'TL',
  name: 'Timor-Leste'
}, {
  code: 'TG',
  name: 'Togo'
}, {
  code: 'TK',
  name: 'Tokelau'
}, {
  code: 'TO',
  name: 'Tonga'
}, {
  code: 'TT',
  name: 'Trinidad And Tobago'
}, {
  code: 'TN',
  name: 'Tunisia'
}, {
  code: 'TR',
  name: 'Turkey'
}, {
  code: 'TM',
  name: 'Turkmenistan'
}, {
  code: 'TC',
  name: 'Turks And Caicos Islands'
}, {
  code: 'TV',
  name: 'Tuvalu'
}, {
  code: 'UG',
  name: 'Uganda'
}, {
  code: 'UA',
  name: 'Ukraine'
}, {
  code: 'AE',
  name: 'United Arab Emirates'
}, {
  code: 'GB',
  name: 'United Kingdom'
}, {
  code: 'US',
  name: 'United States'
}, {
  code: 'UM',
  name: 'United States Outlying Islands'
}, {
  code: 'UY',
  name: 'Uruguay'
}, {
  code: 'UZ',
  name: 'Uzbekistan'
}, {
  code: 'VU',
  name: 'Vanuatu'
}, {
  code: 'VE',
  name: 'Venezuela'
}, {
  code: 'VN',
  name: 'Viet Nam'
}, {
  code: 'VG',
  name: 'Virgin Islands, British'
}, {
  code: 'VI',
  name: 'Virgin Islands, U.S.'
}, {
  code: 'WF',
  name: 'Wallis And Futuna'
}, {
  code: 'EH',
  name: 'Western Sahara'
}, {
  code: 'YE',
  name: 'Yemen'
}, {
  code: 'ZM',
  name: 'Zambia'
}, {
  code: 'ZW',
  name: 'Zimbabwe'
}];
