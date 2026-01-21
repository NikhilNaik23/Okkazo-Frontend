import React from "react";
import ManagerLayout from "../../../components/Layout/manager/ManagerLayout";

const ManagerHomePage = () => {
	return (
		<ManagerLayout
			title="Manager Dashboard Overview"
			subtitle="October 24, 2023 • 09:41 AM"
		>
			<div className="px-6 pb-6">
				{/* Main content goes here */}
				<p>Welcome to the Manager Home Page!</p>
			</div>
		</ManagerLayout>
	);
};

export default ManagerHomePage;

