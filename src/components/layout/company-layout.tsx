import  { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation } from "../shared/companyNav";

// Create your context
const CompanyContext = createContext(null);

export const useCompanyContext = () => {
  return useContext(CompanyContext);
};

const CompanyLayout = ({ children }) => {
    const{id} = useParams();
  const [companyId, setCompanyId] = useState(null);

useEffect(()=>{
    if(id){
        setCompanyId(id);

    }
},[id])

  return (
    <CompanyContext.Provider value={{ companyId, setCompanyId }}>
      <div className="company-layout">
        <div className="pb-4">

        <Navigation />
        </div>
        <main>{children}</main>
      </div>
    </CompanyContext.Provider>
  );
};

export default CompanyLayout;
