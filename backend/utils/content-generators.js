/**
 * Content Generation Utilities
 * 
 * Functions for generating realistic text content for campaigns, including
 * business plans, descriptions, problem statements, and solutions.
 * Content is tailored to Nigerian business context and crowdfunding scenarios.
 */

const { randomElement, randomInt } = require('./random-helpers');

/**
 * Generate a business plan with specified minimum length
 * @param {number} minLength - Minimum character length for the business plan
 * @returns {string} Generated business plan text
 */
function generateBusinessPlan(minLength = 500) {
  const businessPlanTemplates = [
    `Our business model focuses on sustainable growth through strategic market penetration. We will establish operations in key Nigerian cities, starting with Lagos and Abuja. Our revenue streams include direct sales, subscription services, and strategic partnerships with established enterprises. We project a 40% year-over-year growth rate based on market analysis and competitive positioning. Our team brings together expertise in operations, finance, and technology to execute this vision effectively. We will invest heavily in talent acquisition and infrastructure development to support scaling. Our financial projections show break-even within 18 months and profitability by year two. We are committed to maintaining high operational standards while keeping costs competitive. Our expansion strategy includes regional offices and distribution centers across Nigeria. We will leverage technology to optimize supply chain and customer engagement. Our competitive advantage lies in our innovative approach and deep understanding of local market dynamics. We plan to achieve market leadership through consistent quality and customer satisfaction. Our long-term vision is to become a household name in our industry across West Africa.`,
    
    `We will implement a phased rollout strategy beginning with pilot programs in selected markets. Phase one focuses on establishing brand presence and building customer base. Phase two involves scaling operations and expanding product offerings. Phase three targets market consolidation and profitability optimization. Each phase includes specific milestones and success metrics. We will maintain agile operations to adapt to market feedback and changing conditions. Our technology infrastructure will support seamless scaling without compromising service quality. We plan to build strategic alliances with complementary businesses to accelerate growth. Our marketing strategy emphasizes digital channels and community engagement. We will invest in customer retention programs to maximize lifetime value. Our operational excellence framework ensures consistent delivery across all touchpoints. We are committed to environmental sustainability and social responsibility in all operations. Our governance structure ensures transparency and accountability to stakeholders. We will establish advisory boards with industry experts to guide strategic decisions.`,
    
    `Market research indicates strong demand for our products and services in Nigeria. We have identified three primary customer segments with distinct needs and purchasing power. Our pricing strategy balances affordability with profitability and market positioning. We will differentiate through superior quality, customer service, and innovation. Our supply chain strategy emphasizes reliability and cost efficiency. We plan to establish partnerships with local suppliers to support community development. Our quality assurance processes exceed industry standards and regulatory requirements. We will implement continuous improvement programs across all business functions. Our customer feedback mechanisms ensure we remain responsive to market needs. We are building a strong organizational culture that attracts and retains top talent. Our training and development programs ensure team members have skills for success. We will establish performance metrics and accountability systems throughout the organization. Our financial management practices ensure prudent use of capital and resources. We are committed to transparent reporting and stakeholder communication.`,
    
    `Our competitive analysis shows significant opportunities for differentiation and market capture. We have identified key success factors and potential risks with mitigation strategies. Our unique value proposition addresses unmet customer needs in the market. We will build brand loyalty through consistent delivery and exceptional experiences. Our distribution strategy leverages both direct and indirect channels for maximum reach. We plan to establish customer service centers in major cities for local support. Our technology investments will create barriers to entry and sustainable competitive advantages. We will monitor market trends and adjust strategies accordingly. Our financial projections are based on conservative assumptions and market data. We have secured initial funding and have clear pathways to additional capital. Our exit strategy provides options for investors and stakeholders. We are building a scalable business model that can expand across multiple markets. Our long-term sustainability depends on continuous innovation and market responsiveness.`
  ];

  let plan = randomElement(businessPlanTemplates);
  
  // If minLength is large, concatenate multiple templates
  while (plan.length < minLength) {
    plan += ' ' + randomElement(businessPlanTemplates);
  }
  
  return plan.substring(0, Math.max(minLength, plan.length));
}

/**
 * Generate a campaign description with varied length
 * @param {number} minLength - Minimum character length (default: 200)
 * @param {number} maxLength - Maximum character length (default: 1000)
 * @returns {string} Generated description text
 */
function generateDescription(minLength = 200, maxLength = 1000) {
  const descriptionTemplates = [
    `We are launching an innovative solution designed to transform how Nigerians access essential services. Our platform combines cutting-edge technology with deep local market understanding. We have assembled a team of experienced professionals committed to excellence. Our mission is to create sustainable value for customers, employees, and communities. We believe in the power of innovation to solve real-world problems. Our approach emphasizes customer-centricity and continuous improvement. We are excited about the opportunity to make a meaningful impact in Nigeria's economy.`,
    
    `This campaign represents a significant opportunity to invest in a high-growth sector. We have identified market gaps and developed solutions that address real customer needs. Our business model has been validated through extensive market research and pilot testing. We are seeking partners who share our vision for transforming the industry. Our team brings diverse expertise and proven track records of success. We are committed to transparency and regular communication with all stakeholders. Join us in building something extraordinary that will benefit millions of Nigerians.`,
    
    `Our initiative focuses on creating sustainable economic opportunities in underserved communities. We combine social impact with commercial viability to ensure long-term success. Our approach has been tested and refined through multiple iterations. We are proud of our commitment to ethical business practices and community development. Our products and services are designed with input from end-users. We believe that business success and social responsibility go hand in hand. We invite you to be part of this transformative journey.`,
    
    `We are building a world-class organization that sets new standards in our industry. Our vision is ambitious but achievable with the right resources and partnerships. We have a clear roadmap with specific milestones and success metrics. Our team is passionate about delivering exceptional value to customers. We are committed to creating a positive work environment and career opportunities. Our culture emphasizes innovation, collaboration, and continuous learning. We are excited to share this opportunity with forward-thinking investors.`
  ];

  const targetLength = randomInt(minLength, maxLength);
  let description = randomElement(descriptionTemplates);
  
  // Adjust length by adding or truncating
  while (description.length < targetLength) {
    description += ' ' + randomElement(descriptionTemplates);
  }
  
  return description.substring(0, targetLength);
}

/**
 * Generate a problem statement with varied length
 * @param {number} minLength - Minimum character length (default: 300)
 * @param {number} maxLength - Maximum character length (default: 800)
 * @returns {string} Generated problem statement text
 */
function generateProblemStatement(minLength = 300, maxLength = 800) {
  const problemStatements = [
    `Nigeria's current infrastructure faces significant challenges that limit economic growth and opportunity. Many communities lack access to reliable services, creating barriers to development. Existing solutions are often expensive, inefficient, or poorly adapted to local contexts. Small businesses struggle with limited access to capital and resources. The informal sector, which employs millions, operates without adequate support systems. Supply chain inefficiencies increase costs and reduce competitiveness. Skills gaps in the workforce limit productivity and innovation. Environmental challenges threaten long-term sustainability. Healthcare and education systems are strained by growing demand. Transportation and logistics networks need modernization. These interconnected challenges require innovative, scalable solutions that address root causes while creating economic value.`,
    
    `Current market conditions reveal significant gaps between supply and demand. Customers are underserved by existing providers who lack innovation or local expertise. The competitive landscape is fragmented with no clear market leader. Regulatory barriers prevent new entrants from disrupting the status quo. Technology adoption remains low due to cost and accessibility issues. Trust and reliability are major concerns for consumers. Quality standards are inconsistent across providers. Customer service is often poor or non-existent. Pricing is not aligned with value delivered. Distribution channels are limited and inefficient. These market failures create opportunities for well-positioned new entrants to capture significant market share and create value.`,
    
    `The agricultural sector, which employs millions of Nigerians, faces critical challenges. Farmers lack access to modern tools, techniques, and markets. Post-harvest losses are substantial due to poor storage and transportation. Access to credit is limited and expensive. Information about best practices and market prices is scarce. Climate variability threatens crop yields and livelihoods. Supply chains are inefficient and favor middlemen over producers. Young people are leaving farming for urban areas. Land tenure issues create uncertainty and limit investment. These challenges reduce productivity and perpetuate poverty in rural areas. Innovative solutions can transform agricultural productivity and rural incomes.`,
    
    `The financial services sector excludes millions of Nigerians from formal banking. Transaction costs are high and accessibility is limited. Trust in financial institutions is low due to past failures. Digital payment adoption is hindered by infrastructure gaps. Microfinance options are inadequate for small business needs. Insurance products are poorly designed for low-income segments. Savings mechanisms are informal and risky. Investment opportunities are concentrated among the wealthy. Financial literacy is low across many demographics. These exclusions perpetuate inequality and limit economic mobility. Inclusive financial solutions can unlock significant economic potential.`
  ];

  const targetLength = randomInt(minLength, maxLength);
  let statement = randomElement(problemStatements);
  
  while (statement.length < targetLength) {
    statement += ' ' + randomElement(problemStatements);
  }
  
  return statement.substring(0, targetLength);
}

/**
 * Generate a solution description with varied length
 * @param {number} minLength - Minimum character length (default: 300)
 * @param {number} maxLength - Maximum character length (default: 800)
 * @returns {string} Generated solution text
 */
function generateSolution(minLength = 300, maxLength = 800) {
  const solutions = [
    `Our solution leverages technology to address market inefficiencies and create value. We have developed a platform that connects supply and demand in innovative ways. Our approach is scalable, affordable, and adapted to Nigerian market conditions. We use data analytics to optimize operations and improve decision-making. Our team provides training and support to ensure successful adoption. We have built partnerships with key stakeholders to accelerate implementation. Our pricing model ensures affordability while maintaining sustainability. We are committed to continuous improvement based on user feedback. Our technology infrastructure is robust and secure. We prioritize user experience and accessibility. Our solution creates positive externalities for communities and the environment. We measure impact through clear metrics and transparent reporting. Our long-term vision is to become the market standard in our sector.`,
    
    `We are implementing a comprehensive strategy that addresses root causes of market failures. Our approach combines technology, process innovation, and human capital development. We have designed our solution based on extensive customer research and testing. Our business model creates value for all stakeholders in the ecosystem. We are building partnerships with complementary service providers. Our team has deep expertise in both technology and local market dynamics. We are committed to ethical practices and transparent operations. Our solution is designed for scalability across multiple markets. We have clear metrics for measuring success and impact. We are investing in talent development and organizational capacity. Our governance structure ensures accountability and good decision-making. We believe our solution can transform the industry and create lasting value.`,
    
    `Our innovative approach combines traditional wisdom with modern technology. We have studied successful models globally and adapted them for Nigeria. Our solution is designed to be culturally appropriate and locally relevant. We are working with communities to ensure our approach meets real needs. Our implementation strategy includes phased rollout and continuous learning. We have built feedback mechanisms to ensure responsiveness to market needs. Our team includes local experts who understand market nuances. We are committed to building local capacity and creating employment. Our solution creates positive spillover effects for related industries. We measure success through both financial and social impact metrics. We are transparent about challenges and committed to addressing them. Our long-term vision is sustainable transformation of the sector.`,
    
    `We have developed a solution that is both innovative and practical. Our approach balances ambition with realism about implementation challenges. We have tested our solution with early adopters and refined based on feedback. Our business model is financially sustainable and creates value for investors. We are building a team with complementary skills and shared vision. Our technology is reliable, secure, and user-friendly. We have clear plans for scaling operations as demand grows. We are committed to maintaining quality as we expand. Our solution creates opportunities for partners and complementary businesses. We measure impact through rigorous evaluation and transparent reporting. We are committed to continuous improvement and adaptation. Our vision is to build a thriving ecosystem that benefits all participants.`
  ];

  const targetLength = randomInt(minLength, maxLength);
  let solution = randomElement(solutions);
  
  while (solution.length < targetLength) {
    solution += ' ' + randomElement(solutions);
  }
  
  return solution.substring(0, targetLength);
}

module.exports = {
  generateBusinessPlan,
  generateDescription,
  generateProblemStatement,
  generateSolution
};
