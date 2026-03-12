// =============================================
// MODELO CAMPAIGN - GROW HOUSE
// =============================================

const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'El asunto es obligatorio'],
        trim: true,
        maxlength: [200, 'El asunto no puede tener más de 200 caracteres']
    },
    message: {
        type: String,
        required: [true, 'El mensaje es obligatorio'],
        trim: true,
        maxlength: [2000, 'El mensaje no puede tener más de 2000 caracteres']
    },
    type: {
        type: String,
        enum: ['nuevo_producto', 'descuento', 'novedad', 'general'],
        default: 'general'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'vip', 'inactive'],
        default: 'all'
    },
    recipientCount: {
        type: Number,
        default: 0
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;