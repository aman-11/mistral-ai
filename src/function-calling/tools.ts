import {Tool} from "@mistralai/mistralai/models/components/tool";

const orders = [
    {
        orderNumber: "ON-001",
        customerName: "John Doe",
        items: [
            { productId: "A101", name: "Laptop", quantity: 1, price: 1000 },
            { productId: "B202", name: "Mouse", quantity: 2, price: 25 }
        ],
        total: 1050,
        status: "Shipped",
        orderDate: "2025-01-20"
    },
    {
        orderNumber: "ON-002",
        customerName: "Jane Smith",
        items: [
            { productId: "C303", name: "Desk Chair", quantity: 1, price: 150 },
            { productId: "D404", name: "Notebook", quantity: 3, price: 5 }
        ],
        total: 165,
        status: "Processing",
        orderDate: "2025-01-22"
    },
    {
        orderNumber: "ON-003",
        customerName: "Emily Brown",
        items: [
            { productId: "E505", name: "Monitor", quantity: 2, price: 200 },
            { productId: "F606", name: "Keyboard", quantity: 1, price: 50 },
            { productId: "G707", name: "Webcam", quantity: 1, price: 75 }
        ],
        total: 725,
        status: "Delivered",
        orderDate: "2025-01-18"
    },
    {
        orderNumber: "ON-004",
        customerName: "Michael Green",
        items: [
            { productId: "H808", name: "Graphics Card", quantity: 1, price: 1200 }
        ],
        total: 1200,
        status: "Cancelled",
        orderDate: "2025-01-23"
    }
];

function getOrderStatus({ orderNumber }: {orderNumber: string}): Record<string, string>{
    const order = orders
        .find(order => order.orderNumber === orderNumber)

    if(order) {
        return {status: order.status};
    }

    return {error: 'Order not found'};
}

function getOrderDate({ orderNumber }: {orderNumber: string}): Record<string, string> {
    const order = orders
        .find(order => order.orderNumber === orderNumber)

    if(order) {
        return {status: order.orderDate};
    }

    return {error: 'Order not found'};
}

export const toolsForAi: Tool[] = [
    {
        "type": "function",
        "function": {
            "name": "getOrderStatus",
            "description": "Get order status by order number",
            "parameters": {
                "type": "object",
                "properties": {
                    "orderNumber": {
                        "type": "string",
                        "description": "The order number."
                    }
                },
                "required": ["orderNumber"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "getOrderDate",
            "description": "Get order date by order number",
            "parameters": {
                "type": "object",
                "properties": {
                    "orderNumber": {
                        "type": "string",
                        "description": "The order number."
                    }
                },
                "required": ["orderNumber"]
            }
        }
    }
];

export type GetOrderStatus=(request: { orderNumber: string }) => Record<string, string>;
export type GetOrderDate=(request: { orderNumber: string }) => Record<string, string>;

export const toolCallByName: Record<string, GetOrderStatus|GetOrderDate> = {
    'getOrderStatus': getOrderStatus,
    'getOrderDate': getOrderDate,
}
