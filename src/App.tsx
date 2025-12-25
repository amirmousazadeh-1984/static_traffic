// import React from 'react';
// import { useState } from 'react';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
// import { IntersectionList } from './components/IntersectionList';
// import { IntersectionDetails } from './components/IntersectionDetails';
// import { ZoneCalibration } from './components/ZoneCalibration';
// import { PTZCalibration } from './components/PTZCalibration';
// import { IntersectionDashboard } from './components/IntersectionDashboard';
// import { Intersection } from './types';
// import { Camera, MapPin, Settings, Monitor } from 'lucide-react';
// import { Toaster } from './components/ui/sonner';

// function App() {
//   const [activeTab, setActiveTab] = useState('intersections');
//   const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);

//   const handleSelectIntersection = (intersection: Intersection) => {
//     setSelectedIntersection(intersection);
//     setActiveTab('dashboard');
//   };

//   const handleStartZoneCalibration = () => {
//     setActiveTab('zone-calibration');
//   };

//   const handleStartPTZCalibration = () => {
//     setActiveTab('ptz-calibration');
//   };

//   const handleOpenDashboard = () => {
//     setActiveTab('dashboard');
//   };

//   const isIntersectionSelected = selectedIntersection !== null;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
//       {/* Header */}
//       <div className="bg-white border-b shadow-sm">
//         <div className="max-w-[1800px] mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
//                 <Camera className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-slate-900">سیستم هوشمند نظارت ترافیکی</h1>
//                 <p className="text-sm text-slate-600">مدیریت و کنترل چهارراه‌های شهری</p>
//               </div>
//             </div>
//             {selectedIntersection && (
//               <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
//                 <MapPin className="w-4 h-4 text-blue-600" />
//                 <span className="text-sm text-slate-700">{selectedIntersection.name}</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Navigation Tabs */}
//       <div className="bg-white border-b">
//         <div className="max-w-[1800px] mx-auto px-6">
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="w-full justify-start border-0 bg-transparent h-12 p-0 gap-1">
              
//               <TabsTrigger
//                 value="intersections"
//                 className="data-[state=active]:bg-blue-50 cursor-pointer data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg  px-6"
//               >
//                 <MapPin className="w-4 h-4 ml-2" />
//                 داشبورد
//               </TabsTrigger>
             
              
//                <TabsTrigger
//                 value="dashboard"
//                 disabled={!isIntersectionSelected}
//                 className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg  px-6 disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <Monitor className="w-4 h-4 ml-2" />
// مشخصات دوربین های چهارراه              </TabsTrigger>
                
//               <TabsTrigger
//                 value="zone-calibration"
//                 disabled={!isIntersectionSelected}
//                 className="data-[state=active]:bg-blue-50  cursor-pointer data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg  px-6 disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
//                 </svg>
//                 کالیبراسیون مناطق
//               </TabsTrigger>
//               <TabsTrigger
//                 value="ptz-calibration"
//                 disabled={!isIntersectionSelected}
//                 className="data-[state=active]:bg-blue-50  cursor-pointer data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg  px-6 disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <Camera className="w-4 h-4 ml-2" />
//                 کالیبراسیون PTZ
//               </TabsTrigger>


              
              
//               {/* <TabsTrigger
//                 value="details"
//                 disabled={!isIntersectionSelected}
//                 className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg  px-6 disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <Settings className="w-4 h-4 ml-2" />
//                 جزئیات و تنظیمات
//               </TabsTrigger> */}
            
              
//             </TabsList>

//             <TabsContent value="intersections" className="mt-0">
//               <IntersectionList onSelectIntersection={handleSelectIntersection} />
//             </TabsContent>

//             {/* <TabsContent value="details" className="mt-0">
//               {selectedIntersection && (
//                 <IntersectionDetails
//                   intersection={selectedIntersection}
//                   onStartZoneCalibration={handleStartZoneCalibration}
//                   onStartPTZCalibration={handleStartPTZCalibration}
//                   onOpenDashboard={handleOpenDashboard}
//                 />
//               )}
//             </TabsContent> */}

//             <TabsContent value="zone-calibration" className="mt-0">
//               {selectedIntersection && (
//                 <ZoneCalibration intersection={selectedIntersection} />
//               )}
//             </TabsContent>

//             <TabsContent value="ptz-calibration" className="mt-0">
//               {selectedIntersection && (
//                 <PTZCalibration intersection={selectedIntersection} />
//               )}
//             </TabsContent>

//             <TabsContent value="dashboard" className="mt-0">
//               {selectedIntersection && (
//                 <IntersectionDashboard intersection={selectedIntersection} />
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
      
//       <Toaster position="top-center" richColors dir="rtl" />
//     </div>
//   );
// }

// export default App;


// src/App.tsx

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { IntersectionList } from './components/IntersectionList';
import { IntersectionDetails } from './components/IntersectionDetails';
import { ZoneCalibration } from './components/ZoneCalibration';
import { PTZCalibration } from './components/PTZCalibration';
import { IntersectionDashboard } from './components/IntersectionDashboard';
import { Intersection } from './types';
import { Camera, MapPin, Monitor } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

function App() {
  const [activeTab, setActiveTab] = useState('intersections');
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);

  const handleSelectIntersection = (intersection: Intersection) => {
    setSelectedIntersection(intersection);
    setActiveTab('dashboard');
  };

  const isIntersectionSelected = selectedIntersection !== null;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* هدر مینیمال، کم‌ارتفاع و متمایز */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-md">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* لوگو و عنوان - مینیمال */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">نظارت ترافیکی</h1>
              </div>
            </div>

            {/* چهارراه انتخاب‌شده - مینیمال */}
            {selectedIntersection && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{selectedIntersection.name}</span>
              </div>
            )}
          </div>

          {/* تب‌ها - مینیمال و تمیز */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full -mb-px">
            <TabsList className="w-full justify-start bg-transparent h-12 p-0 gap-8 border-b border-slate-200">
              <TabsTrigger
                value="intersections"
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-blue-700 transition-colors"
              >
               <MapPin className="w-4 h-4 ml-2" />
                داشبورد
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>

              <TabsTrigger
                value="dashboard"
                disabled={!isIntersectionSelected}
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-blue-700 transition-colors disabled:opacity-40"
              >
               <Monitor className="w-4 h-4 ml-2" />
                مشخصات دوربین های چهارراه 
                
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>

              <TabsTrigger
                value="zone-calibration"
                disabled={!isIntersectionSelected}
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-blue-700 transition-colors disabled:opacity-40"
              >
               
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                کالیبراسیون مناطق
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>

              <TabsTrigger
                value="ptz-calibration"
                disabled={!isIntersectionSelected}
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-blue-700 transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                کالیبراسیون مناطق
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>


       
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="pt-6">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="intersections" className="mt-0">
            <IntersectionList onSelectIntersection={handleSelectIntersection} />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            {selectedIntersection && <IntersectionDashboard intersection={selectedIntersection} />}
          </TabsContent>

          <TabsContent value="zone-calibration" className="mt-0">
            {selectedIntersection && <ZoneCalibration intersection={selectedIntersection} />}
          </TabsContent>

          <TabsContent value="ptz-calibration" className="mt-0">
            {selectedIntersection && <PTZCalibration intersection={selectedIntersection} />}
          </TabsContent>
        </Tabs>
      </main>

      <Toaster position="top-center" richColors dir="rtl" />
    </div>
  );
}

export default App;