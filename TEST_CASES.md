# Clothing CRM Test Cases

## Overview

This document outlines test cases for our ticket-based clothing CRM system, focusing on customer service, contextual follow-ups, and personalized engagement based on interaction history.

## Test Case Structure

Each test case includes:

- **Scenario**: The specific situation and context
- **Customer Context**: Previous tickets, interactions, and purchase history
- **Expected Response**: What the agent should generate
- **Success Criteria**: How to evaluate the response quality

## Test Cases

### 1. Active Ticket Follow-up - Size Exchange

**Scenario**: Customer has an open ticket requesting a size exchange for jeans
**Customer Context**:

- Active ticket ID: #1234
- Product: Slim-fit jeans
- Current size: 32/32
- Requested size: 30/32
- Ticket age: 2 days
**Expected Response**:
- Status update on exchange process
- Confirmation of size availability
- Clear next steps
**Success Criteria**:
- References ticket number
- Addresses specific exchange request
- Provides actionable information
- Maintains professional tone

### 2. Post-Resolution Upsell - Jeans Purchase

**Scenario**: Follow up on recently resolved jean exchange ticket
**Customer Context**:

- Resolved ticket ID: #1234
- Resolution: Successful exchange to size 30/32
- Resolution date: 1 week ago
- Customer satisfaction: Positive
**Expected Response**:
- Satisfaction check
- Relevant jean accessories suggestion
- Similar style recommendations
**Success Criteria**:
- References successful resolution
- Contextual product suggestions
- Natural transition to recommendations

### 3. Multiple Active Tickets - Priority Handling

**Scenario**: Customer has multiple open support tickets
**Customer Context**:

- Ticket #1235: Return request for shirt (3 days old)
- Ticket #1236: Size inquiry for new collection (1 day old)
- Previous resolution time: Average 2 days
**Expected Response**:
- Consolidated update on both tickets
- Clear status for each issue
- Prioritized handling explanation
**Success Criteria**:
- Addresses all open tickets
- Clear distinction between issues
- Logical prioritization

### 4. Delayed Ticket Response

**Scenario**: Ticket without update for 48+ hours
**Customer Context**:

- Ticket ID: #1237
- Issue: Shipping delay inquiry
- Last update: 3 days ago
**Expected Response**:
- Apology for delay
- Current status update
- Next steps with timeline
**Success Criteria**:
- Appropriate apologetic tone
- Concrete update information
- Clear action plan

### 5. Positive Resolution Upsell

**Scenario**: Customer recently had positive resolution of sizing issue
**Customer Context**:

- Resolved ticket: Size guidance for dress
- Purchase made: Cocktail dress
- Resolution satisfaction: High
**Expected Response**:
- Satisfaction confirmation
- Related accessories suggestion
- Similar style recommendations
**Success Criteria**:
- References successful purchase
- Relevant product suggestions
- Maintains positive momentum

### 6. Return Customer Engagement

**Scenario**: Customer returns after successful previous interaction
**Customer Context**:

- Previous ticket: Styling advice
- Purchase history: Formal wear
- Last interaction: 2 months ago
**Expected Response**:
- Welcome back message
- Reference to previous satisfaction
- New collection highlights
**Success Criteria**:
- Acknowledges previous interaction
- Personalized recommendations
- Engaging tone

### 7. Product Inquiry Follow-up

**Scenario**: Customer inquired about product availability
**Customer Context**:

- Ticket: Stock inquiry for winter coat
- Similar past purchases: Premium outerwear
- Price range: $200-300
**Expected Response**:
- Stock update
- Alternative suggestions
- Price-matched recommendations
**Success Criteria**:
- Clear availability information
- Relevant alternatives
- Price sensitivity awareness

### 8. Seasonal Wardrobe Update

**Scenario**: Previous winter wear customer approaching new season
**Customer Context**:

- Past purchase: Winter collection
- Ticket history: Positive sizing experience
- Season: Approaching spring
**Expected Response**:
- Seasonal transition suggestions
- Reference to previous fit satisfaction
- New collection highlights
**Success Criteria**:
- Seasonal relevance
- Personal style consideration
- Previous purchase context

### 9. Style Consultation Follow-up

**Scenario**: Post-styling consultation engagement
**Customer Context**:

- Recent ticket: Style consultation
- Discussed items: Business casual
- Consultation date: 1 week ago
**Expected Response**:
- Consultation follow-up
- Specific item suggestions
- Style guide reminder
**Success Criteria**:
- References consultation
- Specific style recommendations
- Consultation context

### 10. Technical Issue Resolution

**Scenario**: Customer faced website technical issue
**Customer Context**:

- Ticket: Unable to complete purchase
- Cart items: Evening wear
- Issue status: Resolved
**Expected Response**:
- Resolution confirmation
- Cart recovery assistance
- Smooth purchase pathway
**Success Criteria**:
- Technical understanding
- Clear resolution steps
- Purchase facilitation

### 11. First-Time Customer Support

**Scenario**: New customer sizing inquiry
**Customer Context**:

- First ticket: Sizing help
- Browse history: Casual wear
- No purchase history
**Expected Response**:
- Welcoming tone
- Detailed sizing guidance
- First-purchase incentive
**Success Criteria**:
- Appropriate first-time tone
- Clear sizing information
- Encouraging conversion

### 12. High-Value Cart Abandonment

**Scenario**: Customer left items in cart after size inquiry
**Customer Context**:

- Ticket: Size confirmation
- Cart value: $400+
- Items: Premium collection
**Expected Response**:
- Size confirmation
- Cart reminder
- Purchase completion assistance
**Success Criteria**:
- Addresses size concern
- Tactful cart reminder
- Value retention strategy

### 13. Cross-Category Recommendation

**Scenario**: Customer with category-specific purchase history
**Customer Context**:

- Purchase history: Exclusively dresses
- Recent ticket: Dress satisfaction
- Style preference: Classic
**Expected Response**:
- Category expansion suggestion
- Style-matched recommendations
- Complementary items
**Success Criteria**:
- Category relevance
- Style consistency
- Natural suggestions

### 14. Loyalty Program Upgrade

**Scenario**: Customer approaching loyalty tier upgrade
**Customer Context**:

- Current tier: Silver
- Purchase away: $100 from Gold
- Recent ticket: Product inquiry
**Expected Response**:
- Tier upgrade notification
- Benefits preview
- Purchase suggestion
**Success Criteria**:
- Clear tier information
- Benefit explanation
- Motivating tone

### 15. Size Consistency Follow-up

**Scenario**: Customer with multiple size-related tickets
**Customer Context**:

- Multiple size exchanges
- Consistent size pattern
- Various categories
**Expected Response**:
- Size pattern recognition
- Future shopping guidance
- Personalized size advice
**Success Criteria**:
- Pattern acknowledgment
- Helpful size guidance
- Future shopping ease

### 16. Special Event Preparation

**Scenario**: Customer mentioned upcoming event in ticket
**Customer Context**:

- Ticket: Event outfit inquiry
- Event type: Wedding
- Time frame: 1 month
**Expected Response**:
- Event-specific suggestions
- Timeline-appropriate options
- Complete outfit recommendations
**Success Criteria**:
- Event understanding
- Timeline consideration
- Complete solution

### 17. Product Care Inquiry

**Scenario**: Customer seeking care instructions
**Customer Context**:

- Ticket: Cashmere care
- Purchase: Premium knitwear
- First care inquiry
**Expected Response**:
- Detailed care instructions
- Product maintenance tips
- Care products suggestions
**Success Criteria**:
- Clear instructions
- Helpful additional tips
- Related product suggestions

### 18. Return Customer Reactivation

**Scenario**: Customer returns after long absence
**Customer Context**:

- Last purchase: 6 months ago
- Previous tickets: All resolved positively
- Regular size: Known
**Expected Response**:
- Welcome back message
- Style updates since last visit
- Personalized recommendations
**Success Criteria**:
- Appropriate welcome back
- Relevant updates
- Personal touch

### 19. Bundle Purchase Follow-up

**Scenario**: Customer bought multiple coordinating items
**Customer Context**:

- Recent purchase: Full outfit
- Ticket: Styling advice
- Style profile: Business
**Expected Response**:
- Outfit coordination tips
- Additional complementary items
- Style guide inclusion
**Success Criteria**:
- Outfit understanding
- Helpful styling tips
- Relevant additions

### 20. Seasonal Sale Alert

**Scenario**: Previous full-price customer during sale
**Customer Context**:

- Purchase history: Full price
- Wishlist items: On sale
- Previous ticket: Price inquiry
**Expected Response**:
- Personalized sale alert
- Wishlist item highlight
- Similar sale items
**Success Criteria**:
- Timely notification
- Relevant selections
- Value proposition

## Evaluation Metrics

### 1. Context Utilization Accuracy

- Correct interpretation of ticket history
- Appropriate use of purchase history
- Relevant application of customer preferences

### 2. Response Appropriateness

- Tone matching situation
- Information accuracy
- Solution relevance

### 3. Response Time

- Initial response generation
- Follow-up timing
- Multi-ticket handling efficiency

### 4. Error Prevention

- Context misinterpretation
- Inappropriate suggestions
- Tone misalignment

## LangSmith Integration

Each test will be:

1. Recorded with full context
2. Evaluated against success criteria
3. Timed for response metrics
4. Analyzed for improvement patterns
