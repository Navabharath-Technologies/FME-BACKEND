const questions = [
    {
        id: 1,
        question: "Which is mandatory under the parameter Occupational (Workplace) Safety for all enterprises.",
        options: {
            A: "Fire extinguishers with valid date of filling and refilling",
            B: "Attendance sheet for the training provided to employees on Safety",
            C: "First-aid kit",
            D: "Both a & b",
            E: "Both a & c"
        },
        answer: "D"
    },
    {
        id: 2,
        question: "An MSME can upload all the requisite documents (photographs) from the unit or even from any other place/location.",
        options: {
            A: "True",
            B: "False"
        },
        answer: "B"
    },
    {
        id: 3,
        question: "The MSME Sustainable (ZED) Certification Scheme is for:",
        options: {
            A: "Large enterprises",
            B: "Micro enterprises",
            C: "Small and Medium enterprises",
            D: "Both b and c"
        },
        answer: "D"
    },
    {
        id: 4,
        question: "A ZED Facilitator empanelled with only one organising partners under the MSME Sustainable (ZED) Certification Scheme.",
        options: {
            A: "True",
            B: "False"
        },
        answer: "A"
    },
    {
        id: 5,
        question: "To participate in the ZED Certification scheme, an MSME must have:",
        options: {
            A: "Udyam registration number",
            B: "UAM Number",
            C: "EAM number",
            D: "Aadhaar number"
        },
        answer: "A"
    },
    {
        id: 6,
        question: "How many numbers of unit(s) are eligible for ZED Certifications in the same Udyam?",
        options: {
            A: "Only 5",
            B: "Only 2",
            C: "Only 3",
            D: "As many as added in Udyam with different address"
        },
        answer: "D"
    },
    {
        id: 7,
        question: "Workers used safety goggles as a personal protective equipment (PPE) in fabrication industry. What is the purpose of safety goggle?",
        options: {
            A: "To protect the head from injury due to falling or moving objects, impact on stationary objects and from impact due to falls.",
            B: "To protect the hand from injuries such as cuts, grazes, burns, ingress of chemicals & electric shock.",
            C: "To protect eyes from damage due to impact, penetration, burns, splashes and flying particles and ultra violet radiation.",
            D: "To protect the body from injuries such as cuts, grazes, burns"
        },
        answer: "C"
    },
    {
        id: 8,
        question: "An MSME wants to apply for Gold Certification directly without obtained the Bronze Certificate. Is it possible?",
        options: {
            A: "No",
            B: "Yes"
        },
        answer: "B"
    },
    {
        id: 9,
        question: "Number of parameters at the Gold, Silver, and Bronze levels, respectively are:",
        options: {
            A: "5, 10, and 15",
            B: "10, 15, and 20",
            C: "5, 14, and 20",
            D: "20, 14, and 5"
        },
        answer: "D"
    },
    {
        id: 10,
        question: "Number of Man-days (excluding desktop assessment) for the assessment of Gold Level application is:",
        options: {
            A: "3",
            B: "2",
            C: "1",
            D: "4"
        },
        answer: "D"
    },
    {
        id: 11,
        question: "Which is not correct in terms of additional subsidy of 10% given on the cost of certification fee for Micro, Small & Medium Enterprises?",
        options: {
            A: "MSMEs in NER region",
            B: "MSMEs in Himalayan region/aspirational districts",
            C: "MSMEs in LWE/Island territories",
            D: "Women Owned MSMEs"
        },
        answer: "D"
    },
    {
        id: 12,
        question: "All the State governments provide various incentives for ZED Certified MSMEs.",
        options: {
            A: "True",
            B: "False"
        },
        answer: "A"
    },
    {
        id: 13,
        question: "What will you do if you see that the name of MSME on UDYAM mentioned as N/A?",
        options: {
            A: "Move ahead with registration, pledge & certification process",
            B: "Inform MSME that it can't get ZED Certification",
            C: "Inform MSME that it can move forward only after correcting the name on UDYAM",
            D: "None of the above"
        },
        answer: "C"
    },
    {
        id: 14,
        question: "An MSME had pasted a hand written/typed A4 sheet with unit name and address. Will the site exterior photographs be accepted?",
        options: {
            A: "Yes",
            B: "No"
        },
        answer: "B"
    },
    {
        id: 15,
        question: "The correct subsidy on the cost of Certification fee for Medium, Small & Micro Enterprises is:",
        options: {
            A: "80%, 60%, 50% respectively",
            B: "90%, 70%, 50% respectively",
            C: "80%, 70%, 60% respectively",
            D: "50%, 60%, 80% respectively"
        },
        answer: "D"
    },
    {
        id: 16,
        question: "What are the benefits given by the banks for the ZED Certified MSMEs?",
        options: {
            A: "Concession in Processing fee",
            B: "Concession in rate of interest",
            C: "Preference in lending",
            D: "All the above"
        },
        answer: "D"
    },
    {
        id: 17,
        question: "Registration for ZED Certification can be done on:",
        options: {
            A: "Desktop/laptop only",
            B: "ZED MSME mobile app only",
            C: "Both Desktop/laptop & ZED MSME mobile app",
            D: "None of the above"
        },
        answer: "C"
    },
    {
        id: 18,
        question: "What are the purpose of safety posters at the workplace?",
        options: {
            A: "To increase Safety Awareness",
            B: "To educate on how to operate machinery safely and handle materials properly to prevent accident",
            C: "To reinforcing the safety policies of the company and ensure that all the employees are aware of the expected safety standards",
            D: "All the above"
        },
        answer: "D"
    },
    {
        id: 19,
        question: "What is the correct email ID, if there is any query related to the ZED Scheme?",
        options: {
            A: "zed@qcin.org",
            B: "zed.msme@qcin.org",
            C: "msme.zed@qcin.org",
            D: "zedmsme@qcin.org"
        },
        answer: "A"
    },
    {
        id: 20,
        question: "Whether a unit can be processed for certification which has its address different from the one that is mentioned at the time of application?",
        options: {
            A: "Yes",
            B: "No"
        },
        answer: "B"
    },
    {
        id: 21,
        question: "Can an MSME change their login credentials?",
        options: {
            A: "Yes",
            B: "No"
        },
        answer: "A"
    },
    {
        id: 22,
        question: "The current MSME Sustainable (ZED) Certification Scheme is for:",
        options: {
            A: "Service Sector only",
            B: "Manufacturing Sector only",
            C: "All the sectors",
            D: "None of the above"
        },
        answer: "B"
    },
    {
        id: 23,
        question: "Which parameter does not belong to the Bronze Certification?",
        options: {
            A: "Leadership",
            B: "Quality Management",
            C: "Measurement of Timely Delivery",
            D: "Measurement and analysis"
        },
        answer: "D"
    },
    {
        id: 24,
        question: "What are the benefits of ZED Certification:",
        options: {
            A: "Streamlined operations and lower costs",
            B: "Superior quality, reduced rejection, and higher revenues",
            C: "Increased environmental & social benefits",
            D: "All the above"
        },
        answer: "D"
    },
    {
        id: 25,
        question: "Which amongst the following are critical for ZED Bronze Certification?",
        options: {
            A: "Address (lat-long)",
            B: "Proper name board of the unit",
            C: "Cleanliness at working area and toilet for employees",
            D: "Fire extinguisher must have a label clearly depicting the date of filling and refilling",
            E: "All the above"
        },
        answer: "E"
    },
    {
        id: 26,
        question: "The mode of assessment for ZED Bronze certification is:",
        options: {
            A: "Desktop",
            B: "Remote",
            C: "On-site",
            D: "Physical"
        },
        answer: "A"
    },
    {
        id: 27,
        question: "Basic info and documents can be uploaded from:",
        options: {
            A: "Desktop/laptop only",
            B: "ZED MSME mobile app only",
            C: "Both from Desktop/laptop & ZED MSME mobile app",
            D: "None of the above"
        },
        answer: "B"
    },
    {
        id: 28,
        question: "Which statement is correct: 1. The Enterprise name and the Unit name should always be the same. 2. All photographs required for the purpose of ZED certification must be uploaded from the unit itself. 3. The photograph of the product should be of actual product from the unit. 4. The unit should own a functional fire-extinguisher",
        options: {
            A: "1 & 2 only",
            B: "1, 2 & 3 only",
            C: "2, 3, & 4 Only",
            D: "All the above"
        },
        answer: "D"
    },
    {
        id: 29,
        question: "What is the process in case an MSME forgets its login credentials?",
        options: {
            A: "They can email ZED support team from the registered email ID requesting for the login credentials.",
            B: "They can click on the 'forgot password' button and reset the password from the ZED portal itself",
            C: "Password cannot be retrieved",
            D: "a & b"
        },
        answer: "D"
    },
    {
        id: 30,
        question: "The total cost (MSME contributions) of handholding including taxes, for women owned small enterprises is:",
        options: {
            A: "Rs. 2,00,000",
            B: "Rs. 80,000",
            C: "Rs. 60,000",
            D: "Nil"
        },
        answer: "C"
    },
    {
        id: 31,
        question: "ISO 9001 certification is required to obtain ZED Certification?",
        options: {
            A: "TRUE",
            B: "FALSE"
        },
        answer: "B"
    },
    {
        id: 32,
        question: "The vision of the ZED Scheme is:",
        options: {
            A: "To improve MSME manufacturing system & processes",
            B: "To enhance MSME competitiveness",
            C: "To make MSME sustainable and transform them as National and International Champions",
            D: "All the above"
        },
        answer: "D"
    },
    {
        id: 33,
        question: "The correct subsidy on the cost of Certification fee for SC/ST owned Small Enterprises is:",
        options: {
            A: "80%",
            B: "70%",
            C: "60%",
            D: "90%"
        },
        answer: "B"
    },
    {
        id: 34,
        question: "Which of the following is necessary to obtain before applying for any certification?",
        options: {
            A: "ISO Certification",
            B: "ZED Pledge",
            C: "NOC from Ministry of MSME",
            D: "None of the above"
        },
        answer: "B"
    },
    {
        id: 35,
        question: "An MSME can be given exemption if it possesses any ISO certification.",
        options: {
            A: "TRUE",
            B: "FALSE"
        },
        answer: "B"
    },
    {
        id: 36,
        question: "On which of the following, the financial assistance up to Rs. 50,000 can be availed?",
        options: {
            A: "System/Quality Certification",
            B: "Product Certification",
            C: "Product Testing",
            D: "All the Above"
        },
        answer: "D"
    },
    {
        id: 37,
        question: "ESG Stands for:",
        options: {
            A: "Energy, Social and Governance",
            B: "Environment, Social and Governance",
            C: "Environment, Safety and Governance",
            D: "Energy, Safety and Governance"
        },
        answer: "B"
    },
    {
        id: 38,
        question: "If an MSME possesses a valid ISO 9001 certification, which of the following parameters can be exempted from assessment?",
        options: {
            A: "Product Quality & Safety",
            B: "Quality Management",
            C: "Workplace (Occupational) Safety",
            D: "Swachh Workplace"
        },
        answer: "B"
    },
    {
        id: 39,
        question: "Name of the MSME is mentioned on A4 size paper and pasted as name board. Would this attract NC?",
        options: {
            A: "Yes",
            B: "No"
        },
        answer: "A"
    },
    {
        id: 40,
        question: "If an MSME possesses a valid ISO 45001 certification, which of the following parameters can be exempted from assessment?",
        options: {
            A: "Workplace (Occupational) Safety",
            B: "Quality Management",
            C: "Product Quality & Safety",
            D: "Swachh Workplace"
        },
        answer: "A"
    },
    {
        id: 41,
        question: "Number of Man-days (including desktop assessment) for the assessment of Silver Level application is:",
        options: {
            A: "3",
            B: "2",
            C: "1",
            D: "4"
        },
        answer: "C"
    },
    {
        id: 42,
        question: "What is the maximum time frame and number of attempts allowed for an MSME to close the non-conformities (NCs) raised during the assessment for Bronze certification?",
        options: {
            A: "30 days, 5 attempts",
            B: "60 days, 5 attempts",
            C: "45 days, 3 attempts",
            D: "30 days, 3 attempts"
        },
        answer: "A"
    },
    {
        id: 43,
        question: "Subsidy on zero effect solution technology for women owned small enterprise is with a maximum subsidy of Rs. 3,00,000/-.",
        options: {
            A: "60",
            B: "70",
            C: "80",
            D: "90"
        },
        answer: "D"
    },
    {
        id: 44,
        question: "What are the criteria for availing the benefits of handholding support:",
        options: {
            A: "Only Silver Certified MSMEs can get the benefits of handholding",
            B: "MSME must have at least Bronze Certificate",
            C: "Only Gold Certified MSMEs can get the benefits of handholding",
            D: "None of the above"
        },
        answer: "B"
    },
    {
        id: 45,
        question: "The total cost (MSME contributions) of handholding including taxes, for medium enterprises is:",
        options: {
            A: "Rs. 1,00,000",
            B: "Rs. 3,00,000",
            C: "Rs, 5,00,000",
            D: "Rs. 80,000"
        },
        answer: "A"
    },
    {
        id: 46,
        question: "What is the revised certification fee for Bronze, Silver and Gold Certifications?",
        options: {
            A: "Bronze: Rs. 8000, Silver: Rs. 32000 and Gold: Rs. 72000",
            B: "Bronze: Rs. 10000, Silver: Rs. 40000 and Gold: Rs. 90000",
            C: "Bronze: Rs. 10000, Silver: Rs. 30000 and Gold: Rs. 80000",
            D: "None of the above"
        },
        answer: "A"
    },
    {
        id: 47,
        question: "What is the cost of Gold Certification of a micro enterprises belongs to himalayan region? (without joining reward)",
        options: {
            A: "Rs. 8000",
            B: "Rs. 7200",
            C: "Rs. 9000",
            D: "Rs. 10000"
        },
        answer: "B"
    },
    {
        id: 48,
        question: "Which is the correct statement?",
        options: {
            A: "Photographs of single fire extinguisher can not be uploaded in multiple units",
            B: "Photographs of single fire extinguisher can be uploaded in multiple units",
            C: "Both a & b",
            D: "Only b"
        },
        answer: "A"
    },
    {
        id: 49,
        question: "What is the cost of Silver Certification for a small unit belonging to the SC/ST category (including the joining reward)?",
        options: {
            A: "9600",
            B: "9000",
            C: "12000",
            D: "6600"
        },
        answer: "D"
    },
    {
        id: 50,
        question: "Joining reward is applicable for 1 year from the date of registration under ZED Scheme:",
        options: {
            A: "True",
            B: "False"
        },
        answer: "A"
    }
];

module.exports = questions;
