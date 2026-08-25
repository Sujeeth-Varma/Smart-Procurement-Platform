package in.sujeeth.infosysinternproject.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum RequestAction {
    APPROVE,
    REJECT;

    @JsonCreator
    public static RequestAction fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String val = value.trim().toUpperCase();
        for (RequestAction action : RequestAction.values()) {
            if (action.name().equals(val)) {
                return action;
            }
        }
        if ("APPROVED".equals(val) || "ACTIVE".equals(val)) {
            return APPROVE;
        }
        if ("REJECTED".equals(val) || "CLOSED".equals(val)) {
            return REJECT;
        }
        throw new IllegalArgumentException("Invalid status action: '" + value + "'. Allowed values are APPROVE or REJECT");
    }
}
