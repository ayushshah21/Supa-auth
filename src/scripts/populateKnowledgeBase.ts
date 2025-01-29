import { supabase } from '../lib/supabase/client'

interface KnowledgeEntry {
  id: string;
  content: string;
}

const knowledgeBase: KnowledgeEntry[] = [
  {
    id: 'KB01',
    content: 'Title: Return & Exchange Policy\nWe offer a 30-day return policy for all unworn items with original tags. Returns can be initiated through your account or by contacting customer service. Exchanges are processed as a return and new purchase. Shipping costs for returns are covered for defective items only.'
  },
  {
    id: 'KB02',
    content: 'Title: Size Guide\nOur comprehensive size guide helps you find the perfect fit. Measure your bust, waist, and hips to compare with our detailed size charts. For between sizes, we recommend sizing up. Each product page includes specific fit recommendations.'
  },
  {
    id: 'KB03',
    content: 'Title: Shipping & Delivery Times\n\nWe offer standard, expedited, and overnight shipping options. Standard shipping typically arrives within 5–7 business days, while expedited orders can arrive in 2–3 days. Overnight shipping is available for domestic orders placed before 2 PM local time, delivering the next business day.\n\nDuring peak seasons (holiday, sales events), fulfillment may take an additional 1–2 days. We ship Monday through Friday, excluding public holidays. For international orders, delivery can take 7–14 business days depending on customs clearance. Track your package via the link in your shipment confirmation email.'
  },
  {
    id: 'KB04',
    content: 'Title: Tracking & Missing Packages\n\nOnce your order ships, you\'ll receive a tracking number via email. Use this number to see real-time updates on your package\'s location. If tracking shows \'delivered\' but you haven\'t received the package, please wait 24 hours—sometimes the carrier marks it delivered prematurely.\n\nIf the package is still missing after 24 hours, check with neighbors or your building\'s mailroom. In rare cases, contact our support team for assistance. We\'ll work with the carrier to locate the shipment or issue a replacement if deemed lost.'
  },
  {
    id: 'KB05',
    content: 'Title: Payment & Billing\n\nWe accept major credit cards (Visa, MasterCard, American Express), PayPal, and gift cards. Your card is charged only when your order ships. For split shipments, we only charge you for items when they ship out. In some cases, you may see a temporary authorization on your account.\n\nIf a payment fails, please verify your billing address and funds available. PayPal orders must have a confirmed shipping address. For more details, see our Payment FAQ or contact support if you encounter repeated payment issues.'
  },
  {
    id: 'KB06',
    content: 'Title: Common Fabrics & Care Instructions\n\nOur garments use cotton, rayon, polyester blends, wool, and occasionally cashmere. Always check the garment\'s inner label for specific care instructions. Cotton items are generally machine washable in cold water; lay flat to dry to reduce shrinkage.\n\nDelicate fabrics like wool or cashmere typically require hand-washing or dry cleaning to maintain quality. Avoid high-heat drying or harsh detergents. If in doubt, consult the Fabric & Care section on our product pages for recommended care guidelines.'
  },
  {
    id: 'KB07',
    content: 'Title: Promotional Codes & Gift Cards\n\nTo redeem a promo code, enter it at checkout. Only one code can be applied per order, and codes cannot be combined with sitewide sales unless explicitly stated. Promo codes do not apply to gift card purchases, shipping, or taxes.\n\nGift cards are treated like cash and never expire. They can be used across multiple orders until the balance is zero. If you lose a digital gift card code, contact support with proof of purchase to retrieve your balance.'
  },
  {
    id: 'KB08',
    content: 'Title: Custom Orders & Personalization\n\nCertain items can be customized with embroidery or monograms for an additional fee. Custom orders require extra processing time, typically 3–5 business days. Personalized items are non-returnable unless they arrive damaged or incorrect.\n\nWhen placing a custom order, double-check spelling, color choices, and sizing. Once production starts, changes may not be possible. Delivery dates are estimates and can vary if we have high volumes of personalization requests.'
  },
  {
    id: 'KB09',
    content: 'Title: Seasonal Collections & Limited Releases\n\nWe launch new seasonal collections four times a year (Spring, Summer, Fall, and Winter). Limited release items can sell out quickly, so we recommend subscribing to our newsletter for early access. Restocks are not guaranteed for limited styles.\n\nIf an item you wanted is out of stock, consider joining our waitlist for notifications if it returns. Alternatively, check for similar styles in the same category or contact support for style recommendations.'
  },
  {
    id: 'KB10',
    content: 'Title: Sustainability & Ethical Sourcing\n\nWe partner with ethical manufacturers that pay fair wages and ensure safe working conditions. Whenever possible, we source certified organic cotton and recycled materials to reduce environmental impact. We continuously seek new ways to enhance sustainability in our supply chain.\n\nYou\'ll find details on each product\'s page about its material composition and certifications. We also offset carbon emissions for every shipment at no extra cost to you. Learn more in our sustainability report, published annually.'
  },
  {
    id: 'KB11',
    content: 'Title: Partial Shipment & Backorder Process\n\nIf an order contains backordered items, we may split the shipment. We only charge for in-stock items when they ship, and the remaining items are billed upon their release. You\'ll receive separate shipping confirmation emails for each shipment.\n\nBackorder ETAs are estimates. If a backordered item becomes unavailable, we\'ll notify you and either refund that portion or suggest a similar product. You can also cancel backordered items anytime before they ship.'
  },
  {
    id: 'KB12',
    content: 'Title: Store Pickup & Curbside Service\n\nIf you live near one of our physical stores, you can opt for \'In-Store Pickup\' or \'Curbside Pickup\' at checkout. You\'ll receive an email when your order is ready—usually within 2 business days if items are in stock locally.\n\nBring a valid photo ID and your order confirmation to pick up. For curbside, call the store upon arrival. This service is free. Uncollected orders after 10 days may be returned to inventory, and you\'ll be refunded (minus shipping if originally chosen).'
  },
  {
    id: 'KB13',
    content: 'Title: Warranty & Quality Guarantee\n\nWe stand behind our products. If a seam tears, a zipper breaks, or a fabric shows abnormal wear within 90 days of purchase, contact us with photos. We\'ll issue a replacement, repair, or store credit upon verifying the defect.\n\nThis warranty covers manufacturing defects but not normal wear, misuse, or accidental damage (like pet claws, bleach spills, etc.). Proof of purchase is required. If we no longer carry the same style, we\'ll offer a similar item or store credit.'
  },
  {
    id: 'KB14',
    content: 'Title: Contacting Style Consultants\n\nOur style consultants are available via live chat and email. They can advise on fit, fabric, or help you build outfits for special events. Provide your approximate measurements and personal style preferences for the best recommendation.\n\nWe also offer virtual style sessions by appointment. Consultants can walk you through new collections, highlight best-sellers, and offer curated suggestions. This service is free. Book a slot via our \'Style Consultation\' webpage.'
  },
  {
    id: 'KB15',
    content: 'Title: Order Modification & Address Changes\n\nIf your order hasn\'t shipped, you can update your shipping address or remove items by contacting us. Once the package is shipped, changes are not possible—though we can attempt an intercept for an additional carrier fee.\n\nTo modify an existing order, please provide the order number and the new details needed. Large changes may delay processing. If your updated shipping address is in a different region, tax and shipping costs might change accordingly.'
  },
  {
    id: 'KB16',
    content: 'Title: Managing Account & Password Resets\n\nCustomers can log in to their account page to view order history, wishlists, and saved addresses. If you forget your password, use the \'Forgot Password\' link to receive a reset email. The reset link is valid for 30 minutes.\n\nWe recommend updating your password every few months for security. If you suspect unauthorized access, contact us to lock the account and investigate. We never request your password via email or phone.'
  },
  {
    id: 'KB17',
    content: 'Title: Wholesale & Bulk Orders\n\nFor corporate or wholesale inquiries, we offer bulk discounts starting at 50 units. Submit a request through our Wholesale Portal. Once approved, you can place orders via a dedicated account with special pricing.\n\nLead times for bulk orders range from 2–6 weeks depending on inventory and production capacity. Custom branding or labeling may be available. Payment terms vary; we accept wire transfers, corporate cards, or net-30 terms upon approval.'
  },
  {
    id: 'KB18',
    content: 'Title: VIP Loyalty Program Overview\n\nOur loyalty program grants points for every dollar spent. Points unlock tiers: Silver, Gold, and Platinum. Each tier has perks like free shipping or exclusive early access to new collections.\n\nPoints expire if no purchase is made within 12 months. Redeem points at checkout for discounts. For issues with missing points, contact support with your loyalty ID or email. Upgrades to higher tiers are processed automatically once you hit the spending threshold.'
  },
  {
    id: 'KB19',
    content: 'Title: Clearance & Final Sale Policy\n\nClearance items are deeply discounted items that may have limited sizes or older season designs. These are marked \'Final Sale\' and cannot be returned or exchanged unless defective. Check size guides carefully before purchasing.\n\nAny promotional codes typically do not apply to clearance items unless stated. If you receive a defective final sale item, we can offer a replacement if stock remains. Otherwise, we\'ll provide store credit.'
  },
  {
    id: 'KB20',
    content: 'Title: Corporate Social Responsibility Initiatives\n\nWe sponsor local non-profits, focusing on sustainable fashion education. Each quarter, we allocate a percentage of sales to community programs that teach textile recycling and upcycling. We also run an annual clothing drive for underprivileged communities.\n\nOur employees get paid volunteer days to help with reforestation and coastal cleanups. We aim to expand these initiatives globally. Regular updates on CSR activities are posted on our blog and included in our monthly newsletters.'
  }
];

const tickets: KnowledgeEntry[] = [
  {
    id: 'T001',
    content: 'Title: Size Help Request\nCustomer: I\'m usually a size 8 but unsure about your sizing. Can you help?\nAgent: I\'d be happy to help you find the right size. Our size 8 typically fits a 27-28 inch waist and 37-38 inch hip. I recommend checking our size guide and measuring yourself for the best fit.'
  },
  {
    id: 'T002',
    content: 'Title: Return Request\nCustomer: Need to return an unworn dress, tags still attached. What\'s the process?\nAgent: I can help you with that return. Since the item is unworn with tags attached, you can initiate the return through your account or I can help you start the process. Our return window is 30 days from purchase.'
  },
  {
    id: 'T003',
    content: 'Title: Delayed Shipment Inquiry\nDescription: Customer\'s order hasn\'t arrived, tracking is stuck at \'in transit\' for 10 days.\nCustomer: My order\'s been in transit for over a week with no update. Could it be lost?\nAgent: Let\'s investigate with the carrier. We\'ll open a claim if it\'s truly lost and expedite a replacement for you.'
  },
  {
    id: 'T004',
    content: 'Title: Question about Fabric Care for Wool Sweater\nDescription: Customer unsure if they can machine wash a wool-blend sweater.\nCustomer: Can I wash the wool sweater in cold water? Or do I need to dry clean it?\nAgent: We recommend hand-washing or dry cleaning. Machine washing can cause shrinking. For best results, lay flat to dry.'
  },
  {
    id: 'T005',
    content: 'Title: Missing Gift Card Balance\nDescription: Customer claims their e-gift card code says $0 balance even though it should have $50.\nCustomer: I got a digital gift card for $50, but when I try to check out, it says no balance. Please help!'
  },
  {
    id: 'T006',
    content: 'Title: Custom Embroidery Request\nDescription: Customer wants initials embroidered on a denim jacket.\nCustomer: Can I get my initials \'ABC\' embroidered on the back collar? How much extra does it cost?\nAgent: Yes! Custom embroidery is $15 extra. It adds 3 days to processing. Let me know the color you want for the thread.'
  },
  {
    id: 'T007',
    content: 'Title: International Shipping Cost\nDescription: Customer from Canada wants to know how much shipping costs and any duties.\nCustomer: Hi, shipping to Ontario. Will I pay duties? What\'s the total shipping fee?\nAgent: For Canada, shipping is $15 flat. Duties may apply at customs. We estimate duties around 10–15%, but it varies.'
  },
  {
    id: 'T008',
    content: 'Title: Exchange for Smaller Size (Dress)\nDescription: Customer wants to swap a Medium for a Small. Dress is unworn.\nCustomer: I need to swap for a smaller size. Do I pay shipping for the return?\nAgent: We\'ll provide a prepaid return label. Once we get the Medium back, we\'ll ship out the Small at no extra cost.'
  },
  {
    id: 'T009',
    content: 'Title: Item Out of Stock Inquiry\nDescription: Customer asking if a sold-out jacket in XL will be restocked soon.\nCustomer: The jacket I want is out of stock in XL. Will you restock soon?'
  },
  {
    id: 'T010',
    content: 'Title: Cancellation Before Shipping\nDescription: Customer wants to cancel an order that hasn\'t shipped yet.\nCustomer: Please cancel my order #12345. I changed my mind.\nAgent: We canceled it successfully. You won\'t be charged. Let us know if you have any questions.'
  },
  {
    id: 'T011',
    content: 'Title: Refund Not Received\nDescription: Customer says it\'s been 10 days since returning items, no refund in account.\nCustomer: I mailed back my items 2 weeks ago. Still no refund. Please help.'
  },
  {
    id: 'T012',
    content: 'Title: Promo Code Not Working\nDescription: Customer\'s promo code shows invalid at checkout, code was emailed last week.\nCustomer: Your email said \'SUMMER20\' for 20% off, but it won\'t apply. Why is that?\nAgent: Let me check the code\'s validity. It should be active. Try again, or I can manually adjust the discount.'
  },
  {
    id: 'T013',
    content: 'Title: Discolored Shirt After One Wash\nDescription: Customer complains shirt color faded badly after a single wash in cold water.\nCustomer: My new shirt looks 6 months old after one wash. I\'d like a replacement or refund.'
  },
  {
    id: 'T014',
    content: 'Title: Ethical Sourcing Query\nDescription: Customer asks about the sustainability of our cotton sourcing.\nCustomer: Is your cotton organically sourced? I\'m trying to shop sustainably.\nAgent: We partner with certified organic farms wherever possible. Check our product pages for specific certifications.'
  },
  {
    id: 'T015',
    content: 'Title: Broken Zipper on New Jacket\nDescription: Customer found the zipper broken on a newly delivered jacket.\nCustomer: Just got my jacket, but the zipper won\'t budge. Can I get a replacement or repair?'
  },
  {
    id: 'T016',
    content: 'Title: Style Advice for a Wedding Guest Outfit\nDescription: User wants help picking a dress for a summer wedding, not sure about color or cut.\nCustomer: Looking for a pastel, knee-length dress. Need something airy. Suggestions?'
  },
  {
    id: 'T017',
    content: 'Title: Wholesale Inquiry for Boutique\nDescription: Customer runs a small boutique, wants wholesale pricing on 100+ items.\nCustomer: I own a boutique. Interested in stocking your clothing. Do you offer wholesale rates?'
  },
  {
    id: 'T018',
    content: 'Title: Upgrade Loyalty Tier Not Reflected\nDescription: Customer says their points should move them from Gold to Platinum tier, but it hasn\'t updated.\nCustomer: I\'ve spent enough to hit Platinum, but my account still shows Gold. Please fix.'
  },
  {
    id: 'T019',
    content: 'Title: Clearance Shoes Return Request\nDescription: Customer didn\'t realize shoes were final sale, wants to return them anyway.\nCustomer: Bought clearance shoes, but they don\'t fit. Can I return them? They\'re unworn.'
  },
  {
    id: 'T020',
    content: 'Title: Local Charity Support Request\nDescription: Community group asking if the brand donates or sponsors local events.\nCustomer: We have a fundraiser next month. Do you sponsor local causes?'
  },
  {
    id: 'T021',
    content: 'Title: Partial Order Cancellation\nDescription: Customer wants to remove 2 items from a 5-item order before it ships.\nCustomer: Please remove the last 2 items from my order #5678. The first 3 are okay.'
  },
  {
    id: 'T022',
    content: 'Title: Issue with Password Reset Link\nDescription: User says they never receive the reset email; possibly spam filter or wrong email.\nCustomer: I clicked \'Forgot Password,\' but no email arrived. It\'s not in spam. Can you manually reset it?'
  },
  {
    id: 'T023',
    content: 'Title: In-Store Pickup Not Ready\nDescription: Customer showed up for curbside pickup, but store said order not ready yet.\nCustomer: I got an email that my order was ready, but the store can\'t find it. Wasted trip!'
  },
  {
    id: 'T024',
    content: 'Title: Defective Zipper on Backpack\nDescription: Zipper jammed after first use. Customer wonders if this is covered under warranty.\nCustomer: The zipper is stuck. I used it once, so I\'d like a repair or exchange.'
  },
  {
    id: 'T025',
    content: 'Title: Multiple Promo Codes Attempt\nDescription: User tried stacking two discount codes, system only applied one.\nAgent: Unfortunately, we only allow one code per order unless stated otherwise.'
  },
  {
    id: 'T026',
    content: 'Title: Style Consultation Appointment Request\nDescription: User wants a virtual session with a style consultant for business-casual attire.\nCustomer: Need help picking business-casual outfits for a new job. Can I schedule a call?'
  },
  {
    id: 'T027',
    content: 'Title: Bulk Order for Corporate Gifts\nDescription: Company wants 200 tote bags with custom logos for employees.\nCustomer: We need 200 branded totes for an employee event. Any bulk discount?'
  },
  {
    id: 'T028',
    content: 'Title: Points Not Added for Recent Purchase\nDescription: User claims 200 loyalty points are missing from their last order.\nCustomer: My order #7890 was $200, so I should get 200 points. My account only shows 80 points. Help!'
  },
  {
    id: 'T029',
    content: 'Title: Color Fading in First Wash (T-Shirt)\nDescription: Dark green T-shirt faded dramatically after one wash, wants an exchange or refund.\nCustomer: Only wore it once, washed in cold, color is dull now. I\'d like to return.'
  },
  {
    id: 'T030',
    content: 'Title: Request for an Annual Sustainability Report\nDescription: User wants a copy of the brand\'s sustainability report for personal research.\nAgent: Our latest report is on our website under \'Our Impact.\' Let me link you directly!'
  },
  {
    id: 'T031',
    content: 'Title: Address Change: Wrong Zip Code\nDescription: Customer realized they entered a zip code incorrectly, needs to fix before shipment.\nCustomer: Please fix my zip code from 94101 to 94102 before shipping.'
  },
  {
    id: 'T032',
    content: 'Title: Curbside Pickup Confusion\nDescription: User arrived at store, staff said no curbside record. Possibly a system glitch.\nCustomer: I selected curbside. The staff looked confused. Where\'s my order?'
  },
  {
    id: 'T033',
    content: 'Title: Billing Address and Payment Denial\nDescription: Card keeps declining, suspect mismatch with billing address after a move.\nCustomer: I moved recently. My bank might not have updated my address. Payment fails every time.'
  },
  {
    id: 'T034',
    content: 'Title: Dress Already Torn at Seam\nDescription: Brand-new dress with a small hole in the seam. Possibly a manufacturing defect.\nCustomer: I see a tiny hole along the side seam, right out of the package. I\'d like a replacement.'
  },
  {
    id: 'T035',
    content: 'Title: Request for Discount on Backordered Items\nDescription: Customer wants a courtesy discount due to a 3-week delay on a backordered coat.\nCustomer: It\'s been 3 weeks. Any chance of a discount code for the inconvenience?'
  },
  {
    id: 'T036',
    content: 'Title: Final Sale Return Exception Request\nDescription: Customer realized after purchase it was final sale, but item is unworn and too big.\nCustomer: I didn\'t see \'final sale\' on the listing. It\'s brand new, can I return or at least exchange?'
  },
  {
    id: 'T037',
    content: 'Title: Not Receiving Loyalty Emails\nDescription: Customer\'s not getting loyalty tier updates or point statements via email.\nCustomer: I never see any loyalty emails in my inbox. It\'s not spam either. Did I opt out accidentally?'
  },
  {
    id: 'T038',
    content: 'Title: Ethical Cotton Confirmation for Specific Product\nDescription: Customer specifically wants confirmation if item #CTN556 is organic or BCI cotton.\nCustomer: Is the cotton in CTN556 guaranteed organic? I\'d like specifics.'
  },
  {
    id: 'T039',
    content: 'Title: Order Intercept Request\nDescription: Customer realized they need to cancel an item after it already shipped, wants intercept.\nCustomer: I want to remove an item but it\'s already shipped. Can you intercept the package?'
  },
  {
    id: 'T040',
    content: 'Title: Unauthorized Account Access Concern\nDescription: User sees orders they didn\'t place in their account, suspects hacking.\nCustomer: I see 2 orders I never placed. Did someone hack my account? Please lock it and refund if charged.'
  }
];

async function populateKnowledgeBase() {
  try {
    console.log('Starting to populate knowledge base...')
    
    // Add knowledge base articles
    const { data: kbData, error: kbError } = await supabase
      .functions.invoke('populate-kb', {
        body: { entries: knowledgeBase }
      })
    
    if (kbError) throw kbError
    console.log('Knowledge base articles added:', kbData)
    
    // Add historical tickets
    const { data: ticketData, error: ticketError } = await supabase
      .functions.invoke('populate-kb', {
        body: { entries: tickets }
      })
    
    if (ticketError) throw ticketError
    console.log('Historical tickets added:', ticketData)
    
    console.log('Successfully populated knowledge base')
  } catch (error) {
    console.error('Error populating knowledge base:', error)
  }
}

// Run the script
populateKnowledgeBase() 