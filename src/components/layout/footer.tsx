import { Space, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;
const Footer = ({ isMobile }: any) => {
  return (
    <div
      className={`footer border ${
        isMobile ? "bg-blue-800/80" : "bg-blue-600/80"
      }`}
      style={{ backgroundColor: "rgb(8, 14, 20)" }}
    >
      <Title level={4} className="text-white">
        {"Online Clinic"} &reg;
      </Title>
      <Space wrap={true} className="justify-center">
        <Link to="/" className="font-medium text-white underline">
          {"Home"}
        </Link>
        <Link to="/ratings" className="font-medium text-white underline">
          {"Ratings"}
        </Link>
        <Link to="/feedbacks" className="font-medium text-white underline">
          {"Feedbacks"}
        </Link>
        <Link to="/doctors" className="font-medium text-white underline">
          {"Doctors"}
        </Link>
      </Space>
    </div>
  );
};

export default Footer;
