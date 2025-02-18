import React from "react";

function RedactlePage(args: any) {
    console.log(args);
    const doc = args.files[11];
    return <>{doc}</>;
}

export default RedactlePage;
