package com.traffic.management;


/**
 * Legacy wrapper class to satisfy Eclipse's persistent launch configurations
 * and UI state references to the old class name.
 * 
 * This class delegates to the main {@link TrafficManagementApplication}.
 */
public class Trivo1Application {
    public static void main(String[] args) {
        TrafficManagementApplication.main(args);
    }
}
