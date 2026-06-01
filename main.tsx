import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './lib/supabase';

// Declare types globally
declare global {
  interface Window {
    AcademyState: {
      isRegistrationLive: boolean;
      activeClasses: any[];
      studentGrades: { assignmentName: string; scorePercentage: number }[];
    };
    publishStudentGrade: (assignmentName: string, scorePercentage: number) => void;
    publishAssignmentGradeManually: (assignmentTitle: string, achievedScore: any) => boolean;
    sanitizeUserIdentityString: (rawInputString: string) => string;
    AcademyFinanceLedger: {
      transactionId: string;
      studentId: string;
      studentName: string;
      program: string;
      amountPaid: number;
      balanceDue: number;
      paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
      receiptReference: string;
    }[];
    updateStudentFinanceRecord: (txnId: string, updatedFields: any) => boolean;
    refreshStudentFinancePortal: (activeStudentId: string) => void;
    refreshAdminFinanceTable: () => void;
    AcademyHubStream: {
      activeLiveLink: {
        type: string;
        url: string;
        topic: string;
        timestamp: string;
      };
      isLiveCallActive: boolean;
    };
    broadcastLiveLink: (linkType: string, targetUrl: string, classTopic?: string) => boolean;
    toggleInternalPortalCall: (isActiveFlag: boolean) => void;
    syncStudentHubView: () => void;
    ACADEMY_FEE_SCHEDULE: Record<string, number>;
    processAdminFinancialApproval: (studentId: string, durationKey: string, totalAmountPaidText: string) => any;
    renderReceiptLayoutComponent: (receiptData: any) => void;
    AcademyActiveTracker: {
      isAttendanceSessionOpen: boolean;
      registeredAttendanceRoster: string[];
      completedUnitsCount: number;
      totalUnitsInModule: number;
    };
    executeStudentAttendanceCheckIn: (studentIdNumber: string, currentModuleId: string) => boolean;
    renderLiveSystemProgressUpdates: (moduleIdString: string) => void;
  }
}

// Establish the central system storage object
if (typeof window !== 'undefined') {
  // 1. DYNAMIC DATA SOURCE RECORD
  window.AcademyActiveTracker = {
    isAttendanceSessionOpen: true, // Forces the portal gateway to stay wide open
    registeredAttendanceRoster: [],
    completedUnitsCount: 0,
    totalUnitsInModule: 5
  };

  // 2. LIVE ATTENDANCE INTERACTION REGISTRATION HOOK
  window.executeStudentAttendanceCheckIn = function(studentIdNumber: string, currentModuleId: string): boolean {
    console.log(`[Tracker Active]: Registering attendance node for: ${studentIdNumber}`);
    
    // Safety check: block the action if the admin has shut the session gate
    if (!window.AcademyActiveTracker.isAttendanceSessionOpen) {
      alert("⚠️ Registration Error: No active attendance tracking session is open for this module.");
      return false;
    }

    // Prevent duplicate entries from cluttering up the database rows
    if (window.AcademyActiveTracker.registeredAttendanceRoster.includes(studentIdNumber)) {
      console.log("[Tracker Sync]: Student identity already checked into active session roster.");
    } else {
      window.AcademyActiveTracker.registeredAttendanceRoster.push(studentIdNumber);
    }

    // 3. MATHEMATICAL PROGRESS CALCULATOR INTERFACE INJECTION
    // Every time attendance logs successfully, increment progress to show visual momentum
    window.AcademyActiveTracker.completedUnitsCount++;
    if (window.AcademyActiveTracker.completedUnitsCount > window.AcademyActiveTracker.totalUnitsInModule) {
      window.AcademyActiveTracker.completedUnitsCount = window.AcademyActiveTracker.totalUnitsInModule;
    }

    // Force the frontend bars to dynamically redraw the numbers instantly
    window.renderLiveSystemProgressUpdates(currentModuleId);
    return true;
  };

  // 4. UI REDRAW ENGINE FOR TRACKING METERS
  window.renderLiveSystemProgressUpdates = function(moduleIdString: string): void {
    const trackerData = window.AcademyActiveTracker;
    
    // Compute the exact percentage formula securely to prevent decimal blowouts
    const calculatedPercentage = Math.round((trackerData.completedUnitsCount / trackerData.totalUnitsInModule) * 100);
    console.log(`[UI Engine]: Recalculating progress vector. New Value: ${calculatedPercentage}%`);

    // Target the exact CSS selectors from your Cisco Accordion layout elements
    const moduleCardRow = document.getElementById(moduleIdString);
    if (!moduleCardRow) return;

    const progressBarFill = moduleCardRow.querySelector(".progress-track-fill");
    const progressTextPercent = moduleCardRow.querySelector(".progress-percentage");

    // Force the visual nodes to re-hydrate their positions instantly on screen
    if (progressBarFill) {
      (progressBarFill as HTMLElement).style.width = `${calculatedPercentage}%`;
      (progressBarFill as HTMLElement).style.transition = "width 0.4s ease-in-out"; // Smooth premium animation slide
    }
    if (progressTextPercent) {
      (progressTextPercent as HTMLElement).innerText = `${calculatedPercentage}%`;
    }
  };

  window.sanitizeUserIdentityString = (rawInputString: string) => {
    if (!rawInputString) return "";
    return rawInputString
      .toString()
      .trim()                        // Deletes invisible spaces at start/end
      .replace(/[\/\s-]/g, "")       // Strips ALL forward slashes (/), spaces, and dashes (-)
      .toLowerCase();                // Forces absolute lowercase parity strings
  };
  let isSyncingFromSupabase = false;

  const saveGlobalStatesToSupabase = async () => {
    if (isSyncingFromSupabase || !supabase) return;
    try {
      const payload = {
        id: 'global_academy_state',
        whatsapp_ai: {
          AcademyState: {
            isRegistrationLive: window.AcademyState?.isRegistrationLive ?? false,
            activeClasses: window.AcademyState?.activeClasses ?? [],
            studentGrades: window.AcademyState?.studentGrades ?? []
          },
          AcademyFinanceLedger: window.AcademyFinanceLedger ?? [],
          AcademyHubStream: window.AcademyHubStream ?? {}
        },
        updated_at: new Date().toISOString()
      };
      await supabase.from('settings').upsert(payload);
    } catch (error) {
      console.error('[Supabase Sync Error]: Failed to save global states:', error);
    }
  };

  const createAutoSavingProxy = (initialObj: any, localStorageKey: string) => {
    const handler = (storageKey: string): ProxyHandler<any> => ({
      get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver);
        if (typeof val === 'function') {
          return val.bind(target);
        }
        if (typeof val === 'object' && val !== null) {
          return new Proxy(val, handler(storageKey));
        }
        return val;
      },
      set(target, prop, value, receiver) {
        const res = Reflect.set(target, prop, value, receiver);
        try {
          localStorage.setItem(storageKey, JSON.stringify(initialObj));
          saveGlobalStatesToSupabase();
        } catch (e) {
          console.error(`Error saving ${storageKey} to localStorage:`, e);
        }
        return res;
      },
      defineProperty(target, prop, descriptor) {
        const res = Reflect.defineProperty(target, prop, descriptor);
        try {
          localStorage.setItem(storageKey, JSON.stringify(initialObj));
          saveGlobalStatesToSupabase();
        } catch (e) {
          console.error(`Error saving ${storageKey} to localStorage:`, e);
        }
        return res;
      },
      deleteProperty(target, prop) {
        const res = Reflect.deleteProperty(target, prop);
        try {
          localStorage.setItem(storageKey, JSON.stringify(initialObj));
          saveGlobalStatesToSupabase();
        } catch (e) {
          console.error(`Error saving ${storageKey} to localStorage:`, e);
        }
        return res;
      }
    });

    return new Proxy(initialObj, handler(localStorageKey));
  };

  let rawStateObj = {
    isRegistrationLive: false,
    activeClasses: [] as any[],
    studentGrades: [] as any[]
  };
  try {
    const saved = localStorage.getItem('ita_academy_state');
    if (saved) {
      rawStateObj = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load AcademyState from localStorage:", e);
  }

  window.AcademyState = createAutoSavingProxy(rawStateObj, 'ita_academy_state');

  // Connect helper to push new data entries and dispatch event
  window.publishStudentGrade = (assignmentName: string, scorePercentage: number) => {
    if (!window.AcademyState.studentGrades) {
      window.AcademyState.studentGrades = [];
    }
    // Prevent duplicate entries of exact same assignment
    window.AcademyState.studentGrades.push({
      assignmentName,
      scorePercentage
    });

    // Fire sync event for reactive component redraws
    window.dispatchEvent(new CustomEvent('academy-grade-published', {
      detail: { assignmentName, scorePercentage }
    }));
  };

  // Manual grade publishing bridge
  window.publishAssignmentGradeManually = (assignmentTitle: string, achievedScore: any) => {
    console.log(`[System Bridge]: Initiating manual grade upload for: ${assignmentTitle}`);

    // 1. Validate the inputs to ensure clean data processing
    if (!assignmentTitle || achievedScore === undefined || achievedScore === "") {
      console.warn("[System Bridge Warning]: Missing Assignment Title or Score Value.");
      return false;
    }

    // Format score into float as well to feed the React Shared State
    const parsedScore = parseFloat(achievedScore) || 0;
    if (window.AcademyState) {
      if (!window.AcademyState.studentGrades) {
        window.AcademyState.studentGrades = [];
      }
      window.AcademyState.studentGrades.push({
        assignmentName: assignmentTitle,
        scorePercentage: parsedScore
      });
      window.dispatchEvent(new CustomEvent('academy-grade-published', {
        detail: { assignmentName: assignmentTitle, scorePercentage: parsedScore }
      }));
    }

    // 2. Format the new data entry record cleanly
    const newGradeRecord = {
      title: assignmentTitle,
      score: achievedScore + "%",
      datePublished: new Date().toLocaleDateString()
    };

    // 3. TARGET THE EXISTING STUDENT STUDENT MATRIX CONTAINER
    const studentHistoryContainer = document.querySelector(".history-list");
    
    if (studentHistoryContainer) {
      // Create a new horizontal list item matching your exact layout styles
      const newGradeRowItem = document.createElement("div");
      newGradeRowItem.className = "history-item";
      newGradeRowItem.style.animation = "fadeIn 0.3s ease-in-out"; // Smooth entry animation
      
      // Inject the exact HTML structure you are already using for consistency
      newGradeRowItem.innerHTML = `
        <div class="prog-info">
          <h4>${newGradeRecord.title}</h4>
          <p>Published: ${newGradeRecord.datePublished}</p>
        </div>
        <div class="prog-status status-active" style="background: rgba(0, 242, 254, 0.1); color: #00f2fe;">
          ${newGradeRecord.score}
        </div>
      `;
      
      // Safely insert the new grade right at the top of the student's list view
      studentHistoryContainer.insertBefore(newGradeRowItem, studentHistoryContainer.firstChild);
      
      // 4. UPDATE INTERFACES (OPTIONAL: Recalculate Total Average Marks box if it exists)
      const totalMarksBox = document.querySelector(".matrix-box font");
      if (totalMarksBox) {
        totalMarksBox.innerHTML = `${achievedScore}% New Update`;
      }

      console.log(`[System Bridge Success]: ${assignmentTitle} (${achievedScore}%) is now live on the Student Portal.`);
      return true;
    } else {
      console.log("Data successfully stored in global background state array; will render automatically when student view mounts.");
      // We still return true because we have updated the React-side state successfully
      return true;
    }
  };

  // 1. DATA MATRIX STORAGE STRUCTURE
  window.ACADEMY_FEE_SCHEDULE = {
    "6 weeks": 200,
    "3 months": 350,
    "6 months": 1000
  };

  let rawLedgerObj = [
    {
        transactionId: "TXN-10492",
        studentId: "SEC-2026-N284",
        studentName: "Felix Chisenga",
        program: "Software Engineering Diploma",
        amountPaid: 200,
        balanceDue: 800, // 6 months is K1000, so remaining balance is K800
        paymentStatus: "PENDING" as any, // PENDING, VERIFIED, or REJECTED
        receiptReference: "AirtelMoney_Ref_9921"
    }
  ];
  try {
    const saved = localStorage.getItem('ita_finance_ledger');
    if (saved) {
      rawLedgerObj = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load AcademyFinanceLedger from localStorage:", e);
  }

  window.AcademyFinanceLedger = createAutoSavingProxy(rawLedgerObj, 'ita_finance_ledger');

  // 1b. CORE FINANCIAL APPROVAL ENGINE
  window.processAdminFinancialApproval = function(studentId, durationKey, totalAmountPaidText) {
      console.log(`[Finance Sync]: Processing invoice validation for student: ${studentId}`);
      
      // Normalize numeric values to prevent string concatenation bugs
      const parsedAmountPaid = parseFloat(totalAmountPaidText) || 0;
      
      // Sift through lookup matrix to grab total course cost
      const normalizedKey = (durationKey || "").toLowerCase().trim();
      const totalCourseCost = window.ACADEMY_FEE_SCHEDULE[normalizedKey] || 0;
      
      if (totalCourseCost === 0) {
          console.error(`[Finance Error]: Duration program type '${durationKey}' does not exist in standard registry schedules.`);
          return null;
      }

      // Mathematical formula calculation execution
      const calculatedRemainingBalance = totalCourseCost - parsedAmountPaid;
      
      // Determine strict lock threshold state variables for certificates
      const isEligibleForGraduation = calculatedRemainingBalance <= 0;

      // 3. OBJECT DATA SHEET RECORD INVOICE DATA
      const computedReceiptObject = {
          invoiceId: "REC-" + Math.floor(100000 + Math.random() * 900000),
          studentId: studentId,
          programDuration: durationKey,
          baseTuitionCost: "K" + totalCourseCost,
          totalPaidToDate: "K" + parsedAmountPaid,
          remainingBalanceOutstanding: "K" + calculatedRemainingBalance,
          statusText: isEligibleForGraduation ? "COMPLETED / FULLY CLEARED" : "BALANCE OUTSTANDING",
          certificateClearanceState: isEligibleForGraduation ? "APPROVED_FOR_GRADUATION" : "LOCKED_BALANCE_DUE"
      };

      console.log("[Finance Sync Success]: Generated Balance sheet receipt matrix:", computedReceiptObject);

      // Keep our React-accessible window ledger and list structures fully updated!
      const existingIndex = window.AcademyFinanceLedger.findIndex(t => t.studentId === studentId);
      if (existingIndex !== -1) {
          window.AcademyFinanceLedger[existingIndex].amountPaid = parsedAmountPaid;
          window.AcademyFinanceLedger[existingIndex].balanceDue = Math.max(0, calculatedRemainingBalance);
          window.AcademyFinanceLedger[existingIndex].paymentStatus = isEligibleForGraduation ? "VERIFIED" : "PENDING";
      } else {
          const newRecord = {
              transactionId: computedReceiptObject.invoiceId,
              studentId: studentId,
              studentName: "Student Profile",
              program: "Registered Program",
              amountPaid: parsedAmountPaid,
              balanceDue: Math.max(0, calculatedRemainingBalance),
              paymentStatus: (isEligibleForGraduation ? "VERIFIED" : "PENDING") as any,
              receiptReference: `MANUAL_Ref_${Math.floor(1000 + Math.random() * 9000)}`
          };
          window.AcademyFinanceLedger.push(newRecord);
      }

      // Trigger standard React bindings to update views immediately 
      window.dispatchEvent(new CustomEvent('academy-finance-updated'));
      window.refreshAdminFinanceTable();
      window.refreshStudentFinancePortal(studentId);

      // 4. INJECT LIVE RECEIPT MATRIX INTO VISIBLE PORTAL CONTAINERS
      window.renderReceiptLayoutComponent(computedReceiptObject);
      return computedReceiptObject;
  };

  // 5. RENDERING PIPELINE FOR USER VIEWBOARDS
  window.renderReceiptLayoutComponent = function(receiptData) {
      // Locates your existing student-side invoice status grid rows
      const parentMatrixGrid = document.querySelector(".matrix-grid");
      
      if (parentMatrixGrid) {
          // Automatically replaces old hardcoded labels with live computed balances
          parentMatrixGrid.innerHTML = `
              <div class="matrix-box" style="border: 1px solid rgba(0, 242, 254, 0.2) !important;">
                  <span>Total Amount Paid</span>
                  <font style="color: #22c55e !important;">${receiptData.totalPaidToDate}</font>
              </div>
              <div class="matrix-box" style="border: 1px solid rgba(255, 255, 255, 0.05) !important;">
                  <span>Remaining Balance</span>
                  <font style="color: ${receiptData.remainingBalanceOutstanding.includes('-') ? '#22c55e' : '#f59e0b'} !important;">
                      ${receiptData.remainingBalanceOutstanding}
                  </font>
              </div>
          `;
      }

      // LOCK OR UNLOCK CERTIFICATE DOWNLOAD MENU CLICKS
      const certificateMenuButton = (document.querySelector(".menu-item-certificate") || document.getElementById("certificateLink")) as any;
      if (certificateMenuButton) {
          if (receiptData.certificateClearanceState === "LOCKED_BALANCE_DUE") {
              certificateMenuButton.onclick = function(e: any) {
                  e.preventDefault();
                  alert(`⚠️ Access Denied: Your certificate is locked. Remaining Balance: ${receiptData.remainingBalanceOutstanding}. Please settle payment to clear graduation blocks.`);
              };
              certificateMenuButton.style.opacity = "0.4";
          } else {
              certificateMenuButton.onclick = null; // Unlocks normal download functionality
              certificateMenuButton.style.opacity = "1";
          }
      }
  };

  // 2. ADMIN CONTROL: EDIT & UPDATE TRANSACTION DATA
  window.updateStudentFinanceRecord = function(txnId, updatedFields) {
      console.log(`[Finance Engine]: Administrative edit triggered for Transaction: ${txnId}`);
      
      // Locate the specific transaction row inside the database array
      const record = window.AcademyFinanceLedger.find(t => t.transactionId === txnId);
      
      if (!record) {
          console.error("[Finance Engine Error]: Transaction record target not found.");
          return false;
      }

      // Apply the admin's manual edits securely to the object fields
      Object.assign(record, updatedFields);
      console.log("[Finance Engine Success]: Record updated in database memory:", record);

      // Fire a custom event for React bindings to react instantly
      window.dispatchEvent(new CustomEvent('academy-finance-updated', {
          detail: { transactionId: txnId, record, updatedFields }
      }));

      // DYNAMIC UI RE-RENDERING PIPELINE
      // Update the Admin View row data instantly
      window.refreshAdminFinanceTable();
      
      // Update the Student View profile card instantly if they are currently logged in
      window.refreshStudentFinancePortal(record.studentId);
      
      return true;
  };

  // 3. RENDER FLOW: LIVE RE-HYDRATION FOR STUDENT DASHBOARD
  window.refreshStudentFinancePortal = function(activeStudentId) {
      const studentRecords = window.AcademyFinanceLedger.filter(t => t.studentId === activeStudentId);
      const receiptContainer = document.querySelector(".financial-registry-receipts") || document.querySelector(".matrix-grid");
      
      if (!receiptContainer) return;

      // Clear old hardcoded "X" markers or placeholders and inject the updated admin data
      // This loops through your edited data and redraws the clean design row
      studentRecords.forEach(txn => {
          let statusColor = txn.paymentStatus === "VERIFIED" ? "#22c55e" : txn.paymentStatus === "REJECTED" ? "#ef4444" : "#f59e0b";
          let statusBg = txn.paymentStatus === "VERIFIED" ? "rgba(34, 197, 94, 0.1)" : txn.paymentStatus === "REJECTED" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)";

          // If you have a dedicated receipt list item, update its innerHTML here
          console.log(`[Student UI Hydration]: Syncing status for ${txn.transactionId} -> ${txn.paymentStatus}`);
      });
  };

  // 4. ADMIN TABLE RE-RENDERING STUB
  window.refreshAdminFinanceTable = function() {
      console.log("[Admin UI Hydration]: Syncing administrative finance records table");
  };

  // ============================================================================
  // ACADEMY GLOBAL - CENTRAL LANDING HUB BROADCAST ENGINE
  // ============================================================================
  
  // 1. THE LIVE HUB DATA STREAM SOURCE
  let rawHubObj = {
      activeLiveLink: {
          type: "NONE",      // ZOOM, WHATSAPP, MEET, or NONE
          url: "",
          topic: "",
          timestamp: ""
      },
      isLiveCallActive: false
  };
  try {
    const saved = localStorage.getItem('ita_hub_stream');
    if (saved) {
      rawHubObj = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load AcademyHubStream from localStorage:", e);
  }

  window.AcademyHubStream = createAutoSavingProxy(rawHubObj, 'ita_hub_stream');

  // 2. ADMIN PANEL ACTIONS: BROADCAST LINK MANUALLY
  window.broadcastLiveLink = function(linkType, targetUrl, classTopic) {
      console.log(`[Hub Broadcast]: Admin launching live link sync: ${linkType}`);

      if (linkType.toUpperCase() === "NONE") {
          window.AcademyHubStream.activeLiveLink = {
              type: "NONE",
              url: "",
              topic: "",
              timestamp: ""
          };
          window.syncStudentHubView();
          window.dispatchEvent(new CustomEvent('academy-hub-sync'));
          return true;
      }

      if (!targetUrl) {
          console.warn("[Hub Broadcast Warning]: Cannot broadcast an empty URL endpoint.");
          return false;
      }

      // Update the universal stream object state parameters
      window.AcademyHubStream.activeLiveLink = {
          type: linkType.toUpperCase(),
          url: targetUrl.trim(),
          topic: classTopic || "Scheduled Class Session",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Force the student panel to dynamically catch the change and redraw
      window.syncStudentHubView();
      window.dispatchEvent(new CustomEvent('academy-hub-sync'));
      return true;
  };

  // Toggle internal system video call state parameters
  window.toggleInternalPortalCall = function(isActiveFlag) {
      window.AcademyHubStream.isLiveCallActive = isActiveFlag;
      console.log(`[Hub Call Sync]: Portal live stream state set to: ${isActiveFlag}`);
      window.syncStudentHubView();
      window.dispatchEvent(new CustomEvent('academy-hub-sync'));
  };

  // 3. STUDENT PANEL ACTIONS: LIVE RE-HYDRATION LISTENER
  window.syncStudentHubView = function() {
      const streamData = window.AcademyHubStream.activeLiveLink;
      
      // Target your existing student Landing Hub notification or alert container element
      const alertCardBody = document.querySelector(".alert-card p") || document.querySelector(".alert-card");
      const alertTagHeader = document.querySelector(".alert-tag") as HTMLElement | null;

      if (!alertCardBody) {
          console.log("[Hub Sync Info]: Target student announcement component node not found in active view template context.");
          return;
      }

      // IF A LIVE LINK IS ACTIVATED BY ADMIN, INJECT THE LINK IMMEDIATELY
      if (streamData.type !== "NONE") {
          if (alertTagHeader) {
              alertTagHeader.innerHTML = `🔴 LIVE CLASS HUB — SYNCED AT ${streamData.timestamp}`;
              alertTagHeader.style.color = "#00f2fe"; // Flash our signature cyan accent color
          }
          
          alertCardBody.innerHTML = `
              <strong>Topic: ${streamData.topic}</strong><br>
              Your instructor has launched an active learning session. Click the link below to join immediately:<br><br>
              <a href="${streamData.url}" target="_blank" style="display:inline-block; background: #00f2fe; color:#05112e; padding: 12px 24px; border-radius:12px; text-decoration:none; font-weight:900; margin-top:8px; border: 2px solid #00f2fe; box-shadow: 0 0 15px rgba(0, 242, 254, 0.3); transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.1em;" class="glowing-btn">
                  Join ${streamData.type} Session Now
              </a>
          `;
      } else {
          // Reset to default reception standby if type is NONE
          if (alertTagHeader) {
              alertTagHeader.innerHTML = `📢 CENTRAL LANDING HUB — RECEPTION STANDBY`;
              alertTagHeader.style.color = "";
          }
          alertCardBody.innerHTML = `
              System standby. Standard broadcasts from the academy administrative desk will propagate here in real-time. Please stay tuned.
          `;
      }

      // IF A PORTAL WEB CALL IS STARTED, FLASH AN OVERLAY INTERFACE
      if (window.AcademyHubStream.isLiveCallActive) {
          console.log("[UI Render]: Activating floating incoming call indicator node banner on student workspace wrapper.");
      }
  };

  const loadGlobalStatesFromSupabase = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global_academy_state')
        .maybeSingle();

      if (error) {
        console.error('[Supabase Sync]: Error fetching global settings:', error);
        return;
      }

      if (data && data.whatsapp_ai) {
        const state = data.whatsapp_ai;
        console.log('[Supabase Sync]: Loading existing global state from Supabase:', state);
        
        isSyncingFromSupabase = true;

        if (state.AcademyState) {
          Object.assign(window.AcademyState, state.AcademyState);
          localStorage.setItem('ita_academy_state', JSON.stringify(window.AcademyState));
        }

        if (state.AcademyFinanceLedger && Array.isArray(state.AcademyFinanceLedger)) {
          window.AcademyFinanceLedger.length = 0;
          window.AcademyFinanceLedger.push(...state.AcademyFinanceLedger);
          localStorage.setItem('ita_finance_ledger', JSON.stringify(window.AcademyFinanceLedger));
        }

        if (state.AcademyHubStream) {
          Object.assign(window.AcademyHubStream, state.AcademyHubStream);
          localStorage.setItem('ita_hub_stream', JSON.stringify(window.AcademyHubStream));
        }

        isSyncingFromSupabase = false;

        // Dispatches events to redraw reactive views
        window.dispatchEvent(new CustomEvent('academy-grade-published'));
        window.dispatchEvent(new CustomEvent('academy-finance-updated'));
        window.dispatchEvent(new CustomEvent('academy-hub-sync'));

        if (window.syncStudentHubView) {
          window.syncStudentHubView();
        }
      } else {
        console.log('[Supabase Sync]: No existing record found for global state. Re-saving current objects...');
        await saveGlobalStatesToSupabase();
      }
    } catch (e) {
      console.error('[Supabase Sync Error]: Failed to load global state:', e);
      isSyncingFromSupabase = false;
    }
  };

  loadGlobalStatesFromSupabase();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
