import triviaModel from "../models/triviaModel.js";

// Add Trivia Section
const addTrivia = async (req, res) => {
    try {
        const { title, description, trivia } = req.body;

        // Process trivia items
        const processedTrivia = (trivia || []).map((item) => {
            return {
                question: item.question,
                options: item.options,
                correctAnswer: item.correctAnswer,
                hint: item.hint || ""
            };
        });

        const triviaData = new triviaModel({
            title,
            description,
            trivia: processedTrivia,
            order: req.body.order || 0,
            active: true
        });

        await triviaData.save();
        res.json({ success: true, message: "Trivia Section Created", data: triviaData });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// List All Trivia
const listTrivia = async (req, res) => {
    try {
        const trivia = await triviaModel.find({ active: true }).sort({ order: 1 });
        res.json({ success: true, trivia });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Single Trivia
const getTrivia = async (req, res) => {
    try {
        const { id } = req.params;
        const trivia = await triviaModel.findById(id);
        if (!trivia) {
            return res.json({ success: false, message: "Trivia not found" });
        }
        res.json({ success: true, trivia });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Trivia
const updateTrivia = async (req, res) => {
    try {
        const { id, title, description, trivia, order, active } = req.body;

        // Process trivia items
        const processedTrivia = (trivia || []).map((item) => {
            return {
                question: item.question,
                options: item.options,
                correctAnswer: item.correctAnswer,
                hint: item.hint || ""
            };
        });

        const updateData = {
            title,
            description,
            trivia: processedTrivia,
            order: order || 0,
            active: active !== undefined ? active : true,
            updatedAt: Date.now()
        };

        const updated = await triviaModel.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, message: "Trivia Updated", data: updated });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Trivia
const deleteTrivia = async (req, res) => {
    try {
        const { id } = req.body;
        await triviaModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Trivia Deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addTrivia, listTrivia, getTrivia, updateTrivia, deleteTrivia };
