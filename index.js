
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();

const app = express();
const ML_API_URL = "http://localhost:5001"; // ML API server URL
app.use(cors());
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const Complaint = require("./models/Complaint");
const User = require("./models/User");

const normalizePriority = (value) => {
  if (value === undefined || value === null) return 1;
  if (typeof value === "number") return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "high" || normalized === "3") return 3;
  if (normalized === "medium" || normalized === "2") return 2;
  if (normalized === "low" || normalized === "1") return 1;
  return 1;
};

mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true
})
  
  .then(async () => {
    console.log("DB Connected");
     await User.init();
    console.log("Indexes ensured");
  })
  .catch(err => console.log(err));
  // storage config
  //save uploaded images in uploads folder
  const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// serve images
//This line is why your image opens in browser!
app.use("/uploads", express.static("uploads"));


/*app.post("/complaints", async (req, res) => {
 // console.log(req.body);
  const complaint = new Complaint(req.body);
  await complaint.save();
  res.send("Complaint added");
});*/

//upload.single("image") means:

//Accept ONE file
//Field name must be "image" (from form)
//STUDENT:Add Complaint
/*app.post("/complaints", upload.single("image"), async (req, res) => {
  try {
    const complaint = new Complaint({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      student: req.body.student,
      userId: req.body.userId,
      image: req.file ? req.file.filename : ""
    });

    await complaint.save();
    res.send("Complaint added");
  } catch (err) {
    res.status(500).send(err);
  }
});*/
//student add complaints with ML-based priority prediction
app.post("/complaints", upload.array("evidenceImages", 6), async (req, res) => {
  try {
    const { userId, title, description, category} = req.body;

    //1. Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    //2. Allow ONLY students
    if (user.role !== "student") {
      return res.status(403).send("Only students can add complaints");
    }

    //3. Predict priority using ML API
    let priority = 1; // Default to Low
    try {
      const mlResponse = await axios.post(`${ML_API_URL}/predict`, {
        title: title,
        description: description
      });
      priority = mlResponse.data.priority;
      console.log(`🤖 ML API predicted priority: ${mlResponse.data.priority_label} (${priority}) for complaint: "${title}"`);
    } catch (mlError) {
      console.warn("⚠️  ML API error, using default priority:", mlError.message);
      priority = 1; // Fallback to Low priority
    }

    const evidenceImages = Array.isArray(req.files)
      ? req.files.map((file) => file.filename)
      : [];

    //4. Create complaint with ML-predicted priority
    const complaint = new Complaint({
      title,
      description,
      category: category || "other",
      priority,
      student: user.name,
      userId: user._id,
      image: evidenceImages[0] || "",
    });

    await complaint.save();

    res.json({ ok: true, complaint });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// ✅ PUT: Admin updates complaint (after image + status)
/*app.put("/complaints/:id", upload.single("afterImage"), async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, {
      afterImage: req.file ? req.file.filename : "",
      status: "Resolved"
    });

    res.send("Updated successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});*/

// ADMIN: Assign Complaint to Worker

/*app.put("/admin/assign/:complaintId", async (req, res) => {
  try {
    const { userId, workerId, department } = req.body;

    // check admin
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).send("Access denied. Only admins can assign complaints.");
    }
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "worker") return res.status(400).send("Invalid worker");
    await Complaint.findByIdAndUpdate(req.params.complaintId, {
      worker: workerId,
      department
    });

    res.send("Complaint assigned successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});*/
//Admin assign complaint to worker
app.put("/admin/assign/:complaintId", async (req, res) => {
  try {
    const { userId, workerId, department } = req.body;

    // 🔹 1. Validate input
    if (!userId || !workerId || !department) {
      return res.status(400).send("All fields are required");
    }

    // 🔹 2. Check admin
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).send("Access denied. Only admins can assign complaints.");
    }

    // 🔹 3. Check worker
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "worker") {
      return res.status(400).send("Invalid worker");
    }

    // 🔹 4. Check complaint exists
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) {
      return res.status(404).send("Complaint not found");
    }

    // 🔹 5. Update complaint
    complaint.worker = workerId;
    complaint.department = department;
    complaint.status = "Pending";
    complaint.assignedByAdminId = userId;
    complaint.assignedAt = new Date();
    complaint.priority = normalizePriority(complaint.priority);

    await complaint.save();

    res.send("Complaint assigned successfully");

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});
//to get all workers registered
app.get("/workers", async (req, res) => {
  const workers = await User.find({ role: "worker" });
  res.json(workers);
});
// Admin: view pending complaints by priority

app.get("/admin/complaints/pending/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).send("Access denied");
    }

    const data = await Complaint.find({ status: "Pending" })
      .populate("worker", "name email phone") 
      .populate("userId", "name email phone")
      .populate("assignedByAdminId", "name email phone")
      .sort({ priority: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).send(err);
  }
});


// Admin: view resolved complaints

app.get("/admin/complaints/resolved/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).send("Access denied");}
    const data = await Complaint.find({ status: "Resolved" })
        .populate("worker", "name email phone")
        .populate("userId", "name email phone")
        .populate("assignedByAdminId", "name email phone")
        .sort({ updatedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  } 
});





// Admin updates complaint (after image + status)
/*app.put("/admin/complaints/:id", upload.single("afterImage"), async (req, res) => {
  try {
    const userId = req.body.userId; // Send userId in request
    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).send("Access denied. Admins only.");
    }

    await Complaint.findByIdAndUpdate(req.params.id, {
      afterImage: req.file ? req.file.filename : "",
      status: "Resolved",
      priority:0
    });

    res.send("Updated successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});*/





//testing purpose post used
/*app.post("/updateComplaint", upload.single("afterImage"), async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.body.id, {
      afterImage: req.file ? req.file.filename : "",
      status: "Resolved"
    });

    res.send("Updated successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});*/



//to get all complaints(admin view)
/*app.get("/complaintsView", async (req, res) => {
  const data = await Complaint.find();
  res.json(data);
});*/
//admin view (priority set)
/*app.get("/complaints", async (req, res) => {
  const data = await Complaint.find().sort({ priority: -1 });
  res.json(data);
});*/
/*app.get("/complaints", async (req, res) => {
  const data = await Complaint.find({ status: "Pending" }).sort({ priority: -1 });
  res.json(data);
});*/


//WORKER: View Pending Complaints
app.get("/worker/complaints/pending/:workerId", async (req, res) => {
  try {
    const data = await Complaint.find({
      worker: req.params.workerId,
      status: "Pending"
    })
      .populate("worker", "name email phone")
      .populate("userId", "name email phone")
      .populate("assignedByAdminId", "name email phone")
      .sort({ priority: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

//WORKER: View Resolved Complaints
app.get("/worker/complaints/resolved/:workerId", async (req, res) => {
  try {
    const data = await Complaint.find({
      worker: req.params.workerId,
      status: "Resolved"
    })
      .populate("worker", "name email phone")
      .populate("userId", "name email phone")
      .populate("assignedByAdminId", "name email phone")
      .sort({ updatedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

// WORKER: Update Complaint After Work
/*app.put("/worker/complaint/:id", upload.single("afterImage"), async (req, res) => {
  try {
    const { workerId } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).send("Complaint not found");

    // Only assigned worker can update
    if (complaint.worker.toString() !== workerId) {
      return res.status(403).send("Access denied. Not assigned to this worker.");
    }

    await Complaint.findByIdAndUpdate(req.params.id, {
      afterImage: req.file ? req.file.filename : "",
      status: "Resolved",
      priority: 0
    });

    res.send("Complaint updated as resolved");
  } catch (err) {
    res.status(500).send(err);
  }
});*/
//worker update complaint
app.put("/worker/complaint/:id", upload.single("afterImage"), async (req, res) => {
  try {
    const { workerId } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).send("Complaint not found");

    // ✅ Correct check
    if (!complaint.worker || complaint.worker.toString() !== workerId) {
      return res.status(403).send("Access denied. Not assigned to this worker.");
    }

    const updateData = {
      status: "Resolved",
      priority: 0
    };

    // ✅ Only update image if provided
    if (req.file) {
      updateData.afterImage = req.file.filename;
    }

    await Complaint.findByIdAndUpdate(req.params.id, updateData);

    res.send("Complaint updated as resolved");

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

//Student: view Their Pending Complaints
app.get("/complaintsView/:userId", async (req, res) => {
  try{
  const user = await User.findById(req.params.userId);

    if (!user || user.role !== "student") {
      return res.status(403).send("Access denied");
    }
  const data = await Complaint.find({ userId: req.params.userId,status:"Pending"}).populate("worker", "name");
  res.json({ ok: true, complaints: data });
  }
  catch (err) {
    res.status(500).send(err);
  }



});

//Student: view Their Resolved Complaints
app.get("/complaintsView/Resolved/:userId", async (req, res) => {
  try{
  const user = await User.findById(req.params.userId);

    if (!user || user.role !== "student") {
      return res.status(403).send("Access denied");
    }
  const data = await Complaint.find({ userId: req.params.userId,status:"Resolved"}).populate("worker", "name");
  res.json({ ok: true, complaints: data });
  }
  catch (err) {
    res.status(500).send(err);
  }



});

// Student: get complaint detail
app.get("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
        .populate("worker", "name email phone")
        .populate("userId", "name email phone")
        .populate("assignedByAdminId", "name email phone");
    if (!complaint) {
      return res.status(404).send("Complaint not found");
    }
    res.json({ ok: true, complaint });
  } catch (err) {
    res.status(500).send(err);
  }
});



//User REGISTER //worked
/*app.post("/register", async (req, res) => {
  try {
    const { email, name, password,role} = req.body;
     role = role?.trim().toLowerCase();
    
    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).send("Name, email, and password are required.");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists. Please login.");
    }
    // 🔹 ADMIN LOGIC HERE 👇
    if (role === "admin") {

      // Check if admin already exists
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(400).send("Admin already exists");
      }

      // Check admin password
      if (password !== "744") {
        return res.status(400).send("Invalid admin password");
      }
    }

    // Create and save user
    const user = new User(req.body);
    await user.save();

    res.send("User registered successfully");
    
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});*/
//registration
app.post("/register", async (req, res) => {
  try {
    let { email, name, password, role } = req.body; // ✅ use LET

    // 🔹 Normalize role
    role = role?.trim().toLowerCase();

    // 🔹 Validate
    if (!email || !name || !password || !role) {
      return res.status(400).send("All fields are required.");
    }

    // 🔹 Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists.");
    }

    // 🔥 ADMIN LOGIC
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });

      if (adminExists) {
        return res.status(400).send("Admin already exists");
      }

      if (password !== "744") {
        return res.status(400).send("Invalid admin password");
      }
    }

    // ✅ SAVE CLEAN DATA (IMPORTANT FIX)
    const user = new User({
      email,
      name,
      password,
      role
    });

    await user.save();

    res.json({
      ok: true,
      token: user._id,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (err) {
  console.log(err);

  // Duplicate key error (admin or email)
  if (err.code === 11000) {
    return res.status(400).send("User or Admin already exists");
  }

  res.status(500).send("Error registering user");
}
});
// LOGIN
//checks email,password for respective user to login otherwise invalid credentials //worked
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("User not found. Please Register");
    }

    if (user.password !== password) {
      return res.status(401).send("Invalid password");
    }

    //Send user data also
    res.json({
      ok: true,
      token: user._id,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (err) {
    res.status(500).send("Server error");
  }
});




// GET current user by ID (for frontend session verification against MongoDB)
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ADMIN: Save/Update message to worker on a complaint
app.put("/admin/complaints/:id/message", async (req, res) => {
  try {
    const { userId, adminMessage } = req.body;

    // Check admin
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Access denied. Admins only." });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ ok: false, error: "Complaint not found" });
    }

    complaint.adminMessage = adminMessage;
    await complaint.save();

    // Return the updated complaint with populated fields
    const updated = await Complaint.findById(req.params.id)
      .populate("worker", "name email phone")
      .populate("userId", "name email phone")
      .populate("assignedByAdminId", "name email phone");

    res.json({ ok: true, complaint: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
