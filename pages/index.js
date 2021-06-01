import React from "react";
import dynamic from 'next/dynamic';


const Index = () => {
  const DynamicMap = dynamic(() => import('../components/Map'), { ssr: false, loading: () => <p>Loading</p> });

  return (
    <>
      <section>
        <h1>Map</h1>
        <DynamicMap />
      </section>
    </>
  );
};

export default Index;
