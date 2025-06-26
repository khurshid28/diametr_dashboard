import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import BasicTables from "./pages/Tables/BasicTables";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import TeachersPage from "./pages/new/Operators";
import StudentsPage from "./pages/new/Fillials";
import GroupsPage from "./pages/new/Merchants";

import MerchantsPage from "./pages/new/Merchants";
import OperatorsPage from "./pages/new/Operators";
import FillialsPage from "./pages/new/Fillials";
import { ToastContainer } from "react-toastify";
import AppsPage from "./pages/new/Apps";
import StatisticsPage from "./pages/new/Statistics";
import ShopsPage from "./pages/diametr/Shops";

export default function App() {
  return (
    <>
      <Router basename="/">
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />} >
             {/* People Page */}
               <Route path="/" element={<Home />} />
             <Route path="/shops" element={<ShopsPage />} />
              <Route path="/categories" element={<ShopsPage />} />
                <Route path="/payments" element={<ShopsPage />} />
                  <Route path="/products" element={<ShopsPage />} />
             
              <Route path="/news" element={<ShopsPage />} />
               <Route path="/services" element={<ShopsPage />} />
                 <Route path="/workers" element={<ShopsPage />} />
                 <Route path="/ads" element={<ShopsPage />} />



            {/* People Page */}
            {/* <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/sections" element={<SectionsPage />} />
            <Route path="/tests" element={<TestsPage />} />

            <Route path="/results" element={<ResultsPage />} /> */}



            {/* <Route index path="/rate" element={<RatePage />} /> */}

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            {/* <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} /> */}

            {/* Forms */}
            {/* <Route path="/form-elements" element={<FormElements />} /> */}

            {/* Tables */}
            {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

            {/* Ui Elements */}
            {/* <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} /> */}
            {/* <Route path="/videos" element={<Videos />} /> */}

            {/* Charts */}
            {/* <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} /> */}
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

        <ToastContainer position="bottom-right"  autoClose={2000}
  hideProgressBar={false}/>
    </>
  );
}
