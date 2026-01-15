Api for dashboards

General stats

Api \- api/dashboard/general

Response \- ({  
  "statusCode": 200,  
  "success": true,  
  "message": "Success",  
  "data": {  
    "queryStats": \[  
      {  
        "status": "Confirmed",  
        "count": 2  
      },  
      {  
        "status": "Pending",  
        "count": 4  
      },  
      {  
        "status": "Cancelled",  
        "count": 1  
      }  
    \],  
    "clientInvoices": {  
      "count": 3,  
      "totalValue": 7690  
    },  
    "supplierInvoices": {  
      "count": 1,  
      "totalValue": 500  
    }  
  },  
  "totalCount": 1,  
  "error": ""  
}  
)

Client stats  
API \- api/dashboard/client-stats  
Response \- {  
  "statusCode": 200,  
  "success": true,  
  "message": "Success",  
  "data": \[  
    {  
      "clientId": 38,  
      "clientName": "Prathamesh Wadekar",  
      "noOfTours": 2,  
      "totalRevenue": 6690  
    },  
    {  
      "clientId": 35,  
      "clientName": "MANISH GANPATLAL BHAVSAR",  
      "noOfTours": 1,  
      "totalRevenue": 1000  
    },  
    {  
      "clientId": 1,  
      "clientName": "Amit Sharma",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 2,  
      "clientName": "Sneha Patil",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 3,  
      "clientName": "Rahul Mehta",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 4,  
      "clientName": "Pooja Desai",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 16,  
      "clientName": "Juliya  Shekhar",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 17,  
      "clientName": "Faiz Sk",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 19,  
      "clientName": "Parthrukh Pawar",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 22,  
      "clientName": "John liver",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 24,  
      "clientName": "aasif qaji",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 25,  
      "clientName": "Ishant Patil",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 31,  
      "clientName": "Zainab Sk",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 32,  
      "clientName": "Aakash Rane",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 33,  
      "clientName": "Dilip Singh",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 36,  
      "clientName": "DHRUV SHAH",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 39,  
      "clientName": "Prathamesh Wadekar",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 40,  
      "clientName": "ARIF SHAIKH",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 43,  
      "clientName": "Omkar Jawadekar",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    },  
    {  
      "clientId": 45,  
      "clientName": "Prince ",  
      "noOfTours": 0,  
      "totalRevenue": 0  
    }  
  \],  
  "totalCount": 20,  
  "error": ""  
}

Supplier Stats  
Api- api/dashboard/supplier-stats

Response ({  
  "statusCode": 200,  
  "success": true,  
  "message": "Success",  
  "data": {  
    "bySupplier": \[  
      {  
        "supplierName": "vivo",  
        "amount": 500  
      },  
      {  
        "supplierName": "Shreya soft",  
        "amount": 0  
      },  
      {  
        "supplierName": "Patel Industries",  
        "amount": 0  
      },  
      {  
        "supplierName": "Jainul Enterprice",  
        "amount": 0  
      },  
      {  
        "supplierName": "Mukesh LLP",  
        "amount": 0  
      },  
      {  
        "supplierName": "KK Bus travellers",  
        "amount": 0  
      },  
      {  
        "supplierName": "JJ Finince Grp",  
        "amount": 0  
      },  
      {  
        "supplierName": "Shahrukh  Pvt Ltd",  
        "amount": 0  
      },  
      {  
        "supplierName": "adda",  
        "amount": 0  
      },  
      {  
        "supplierName": "nike ",  
        "amount": 0  
      },  
      {  
        "supplierName": "indigo",  
        "amount": 0  
      },  
      {  
        "supplierName": "zudio",  
        "amount": 0  
      },  
      {  
        "supplierName": "hp",  
        "amount": 0  
      },  
      {  
        "supplierName": "om",  
        "amount": 0  
      },  
      {  
        "supplierName": "oppo",  
        "amount": 0  
      },  
      {  
        "supplierName": "whip",  
        "amount": 0  
      },  
      {  
        "supplierName": "USA Based Company",  
        "amount": 0  
      }  
    \],  
    "byCountry": \[  
      {  
        "countryName": "Malasiyia",  
        "amount": 500  
      }  
    \]  
  },  
  "totalCount": 1,  
  "error": ""  
}  
)

Financial reports (data)  
Api \- api/dashboard/financial-report  
Req-   
Api \- {  
  "filterType": "All",  
  "year": 0,  
  "month": 0  
}  -- we could get stats by year and month and all
Res- {  
  "statusCode": 200,  
  "success": true,  
  "message": "Success",  
  "data": {  
    "totalRevenue": 7690,  
    "totalExpenditure": 500,  
    "profitBeforeTax": 8017.36,  
    "profitAfterTax": 7190,  
    "gsT\_Collected": 887.25,  
    "gsT\_Paid": 90  
  },  
  "totalCount": 1,  
  "error": ""  
}

