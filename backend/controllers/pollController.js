import pollModel from "../models/pollModel.js";

// Add Poll
// Add Poll
const addPoll = async (req, res) => {
    try {
        const { title, question, options, endDate } = req.body;
        
        // FIX: Set all currently active polls to false before creating the new one
        await pollModel.updateMany({ active: true }, { active: false });

        const processedOptions = (options || []).map(opt => ({
            text: opt.text || opt,
            votes: 0
        }));

        const pollData = new pollModel({
            title,
            question,
            options: processedOptions,
            endDate: endDate ? new Date(endDate) : null,
            active: true // This is now safely the ONLY active poll
        });

        await pollData.save();
        res.json({ success: true, message: "Poll Created", data: pollData });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// List Active Poll (only one active)
const listPoll = async (req, res) => {
    try {
        const poll = await pollModel.findOne({ active: true });
        res.json({ success: !!poll, poll: poll || null });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Poll
const updatePoll = async (req, res) => {
    try {
        const { id, title, question, options, endDate, active } = req.body;

        const processedOptions = (options || []).map(opt => ({
            text: opt.text || opt,
            votes: 0 // reset votes on update?
        }));

        const updateData = {
            title,
            question,
            options: processedOptions,
            endDate: endDate ? new Date(endDate) : null,
            active: active !== undefined ? active : true,
            updatedAt: Date.now()
        };

        const updated = await pollModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            return res.json({ success: false, message: "Poll not found" });
        }
        res.json({ success: true, message: "Poll Updated", data: updated });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Poll
const deletePoll = async (req, res) => {
    try {
        const { id } = req.body;
        await pollModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Poll Deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Vote on Poll
const votePoll = async (req, res) => {
    try {
        const { optionIndex } = req.body;

        const userId = req.body.userId || req.user?.id; // from auth middleware or body


        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        const poll = await pollModel.findOne({ active: true });
        if (!poll) {
            return res.json({ success: false, message: "No active poll" });
        }

        if (poll.votedUsers.includes(userId)) {
            return res.json({ success: false, message: "Already voted" });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.json({ success: false, message: "Invalid option" });
        }

        // Increment vote
        poll.options[optionIndex].votes += 1;
        poll.votedUsers.push(userId);
        await poll.save();

        res.json({ success: true, poll });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addPoll, listPoll, updatePoll, deletePoll, votePoll };

