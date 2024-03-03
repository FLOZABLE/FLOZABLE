import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  
  navigate('/dashboard')
  return (
    <div>

    </div>
  )
};

export default NotFound;