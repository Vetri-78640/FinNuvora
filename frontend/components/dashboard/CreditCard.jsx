'use client';

export default function CreditCard({
    balance,
    number = "**** **** **** 1234",
    holder = "John Doe",
    expiry = "12/26",
    variant = "primary"
}) {
    const variants = {
        primary: "bg-primary text-background",
        dark: "bg-black text-white border border-border",
    };

    return (
        <div className={`rounded-2xl p-6 flex flex-col justify-between h-56 relative overflow-hidden ${variants[variant]}`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                    <span className="text-sm opacity-80 mb-1">Current Balance</span>
                    <span className="text-3xl font-bold">${balance}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-lg italic">Finance</span>
                </div>
            </div>

            <div className="relative z-10">
                <div className="mb-4 text-xl tracking-widest font-mono">{number}</div>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-xs opacity-70 mb-1">Card Holder</span>
                        <span className="font-medium">{holder}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs opacity-70 mb-1">Expires</span>
                        <span className="font-medium">{expiry}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
