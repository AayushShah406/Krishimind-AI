import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    User, Farm, Field, Crop, SoilReading, IrrigationRecord, WeatherRecord,
    AIRecommendation, CropImage, ImageAnalysis, KnowledgeDocument, Notification
)
from app.core.security import get_password_hash
def seed_database(db: Session):
    from app.models.models import AdvisorAssignment, CropType, AuditLog

    # Check if users already seeded
    existing_farmer = db.query(User).filter(User.email == "farmer@krishimind.ai").first()
    if existing_farmer:
        # Ensure advisor assignment exists
        existing_advisor = db.query(User).filter(User.email == "advisor@krishimind.ai").first()
        if existing_advisor:
            if db.query(AdvisorAssignment).count() == 0:
                farm = db.query(Farm).filter(Farm.user_id == existing_farmer.id).first()
                assignment = AdvisorAssignment(
                    advisor_id=existing_advisor.id,
                    farmer_id=existing_farmer.id,
                    farm_id=farm.id if farm else None,
                    notes="Primary agronomic advisor for wheat and kharif cycles"
                )
                db.add(assignment)
                db.commit()

        # Ensure crop types exist
        if db.query(CropType).count() == 0:
            crop_types = [
                CropType(name="Wheat", scientific_name="Triticum aestivum", category="Cereal", varieties=["GW-496", "GW-322", "Lok-1", "HD-2967", "Sharbati"], growth_stages=["CRI", "Tillering", "Booting", "Flowering", "Milking", "Maturity"], water_requirement_mm=450),
                CropType(name="Rice", scientific_name="Oryza sativa", category="Cereal", varieties=["Basmati 1121", "IR-64", "Sona Masoori", "Gurjari"], growth_stages=["Nursery", "Tillering", "Panicle Initiation", "Flowering", "Harvest"], water_requirement_mm=1200),
                CropType(name="Cotton", scientific_name="Gossypium hirsutum", category="Fiber", varieties=["Bt Cotton RCH-2", "G.Cot.20", "DCH-32"], growth_stages=["Emergence", "Squaring", "Flowering", "Boll Formation", "Boll Opening"], water_requirement_mm=700),
                CropType(name="Groundnut", scientific_name="Arachis hypogaea", category="Oilseeds", varieties=["GG-20", "TG-37A", "Kadiri-6"], growth_stages=["Vegetative", "Flowering", "Pegging", "Pod Development", "Maturity"], water_requirement_mm=500),
                CropType(name="Tomato", scientific_name="Solanum lycopersicum", category="Vegetable", varieties=["Abhinav", "Pusa Ruby", "Arka Rakshak"], growth_stages=["Seedling", "Vegetative", "Flowering", "Fruit Setting", "Ripening"], water_requirement_mm=600)
            ]
            db.add_all(crop_types)
            db.commit()

        # Ensure audit log has entries
        if db.query(AuditLog).count() == 0:
            db.add(AuditLog(user_id=existing_farmer.id, action="FARM_CREATED", resource_type="Farm", details={"farm_name": "Ahmedabad Farm"}))
            db.commit()

        return


    # 1. Users
    farmer = User(
        name="Ramesh Patel",
        email="farmer@krishimind.ai",
        password_hash=get_password_hash("password123"),
        role="FARMER",
        preferred_language="gu",
        location="Ahmedabad, Gujarat",
        is_active=True
    )
    advisor = User(
        name="Dr. Sunita Sharma",
        email="advisor@krishimind.ai",
        password_hash=get_password_hash("password123"),
        role="ADVISOR",
        preferred_language="en",
        location="Gujarat Agricultural University",
        is_active=True
    )
    admin = User(
        name="Platform Admin",
        email="admin@krishimind.ai",
        password_hash=get_password_hash("password123"),
        role="ADMIN",
        preferred_language="en",
        location="New Delhi",
        is_active=True
    )
    db.add_all([farmer, advisor, admin])
    db.commit()

    # 2. Farms
    farm1 = Farm(
        user_id=farmer.id,
        name="Ahmedabad Farm",
        location="Sanand, Ahmedabad, Gujarat",
        area=25.0,
        unit="acres",
        soil_type="Sandy Loam"
    )
    farm2 = Farm(
        user_id=farmer.id,
        name="Punjab Agro Fields",
        location="Ludhiana, Punjab",
        area=40.0,
        unit="acres",
        soil_type="Alluvial Loam"
    )
    farm3 = Farm(
        user_id=farmer.id,
        name="Nashik Vineyards & Crops",
        location="Nashik, Maharashtra",
        area=18.0,
        unit="acres",
        soil_type="Black Soil"
    )
    db.add_all([farm1, farm2, farm3])
    db.commit()

    # 3. Fields
    field_a = Field(
        farm_id=farm1.id,
        name="Field A - North Block",
        area=12.5,
        soil_type="Sandy Loam",
        location="Sanand, Ahmedabad, Gujarat"
    )
    field_b = Field(
        farm_id=farm1.id,
        name="Field B - Canal Side",
        area=12.5,
        soil_type="Clay Loam",
        location="Sanand, Ahmedabad, Gujarat"
    )
    field_c = Field(
        farm_id=farm2.id,
        name="Field 1 - Tube Well",
        area=20.0,
        soil_type="Alluvial Loam",
        location="Ludhiana, Punjab"
    )
    db.add_all([field_a, field_b, field_c])
    db.commit()

    # 4. Crops
    crop1 = Crop(
        field_id=field_a.id,
        name="Wheat",
        variety="GW-322",
        planting_date=datetime.datetime.utcnow() - datetime.timedelta(days=65),
        growth_stage="Flowering",
        status="ACTIVE"
    )
    crop2 = Crop(
        field_id=field_b.id,
        name="Cotton",
        variety="BT-Cotton 2",
        planting_date=datetime.datetime.utcnow() - datetime.timedelta(days=40),
        growth_stage="Vegetative",
        status="ACTIVE"
    )
    crop3 = Crop(
        field_id=field_c.id,
        name="Rice",
        variety="Pusa Basmati 1121",
        planting_date=datetime.datetime.utcnow() - datetime.timedelta(days=35),
        growth_stage="Tillering",
        status="ACTIVE"
    )
    db.add_all([crop1, crop2, crop3])
    db.commit()

    # 5. Soil Readings (Historical series for Field A)
    base_time = datetime.datetime.utcnow()
    soil_readings = [
        SoilReading(field_id=field_a.id, moisture=62.0, ph=6.7, nitrogen=135.0, phosphorus=23.0, potassium=180.0, recorded_at=base_time - datetime.timedelta(days=12)),
        SoilReading(field_id=field_a.id, moisture=65.0, ph=6.8, nitrogen=138.0, phosphorus=23.5, potassium=182.0, recorded_at=base_time - datetime.timedelta(days=9)),
        SoilReading(field_id=field_a.id, moisture=58.0, ph=6.7, nitrogen=140.0, phosphorus=24.0, potassium=181.0, recorded_at=base_time - datetime.timedelta(days=6)),
        SoilReading(field_id=field_a.id, moisture=68.0, ph=6.8, nitrogen=141.0, phosphorus=24.2, potassium=184.0, recorded_at=base_time - datetime.timedelta(days=3)),
        SoilReading(field_id=field_a.id, moisture=71.0, ph=6.8, nitrogen=142.0, phosphorus=24.5, potassium=185.0, recorded_at=base_time - datetime.timedelta(hours=2)),
        SoilReading(field_id=field_b.id, moisture=55.0, ph=7.2, nitrogen=110.0, phosphorus=18.0, potassium=160.0, recorded_at=base_time - datetime.timedelta(hours=4)),
        SoilReading(field_id=field_c.id, moisture=78.0, ph=6.5, nitrogen=155.0, phosphorus=28.0, potassium=210.0, recorded_at=base_time - datetime.timedelta(hours=5))
    ]
    db.add_all(soil_readings)

    # 6. Irrigation Records
    irrigations = [
        IrrigationRecord(field_id=field_a.id, amount=30.0, unit="mm", method="Drip", notes="Scheduled morning drip cycle", date=base_time - datetime.timedelta(days=10)),
        IrrigationRecord(field_id=field_a.id, amount=35.0, unit="mm", method="Drip", notes="Pre-flowering fertigation cycle", date=base_time - datetime.timedelta(days=4)),
        IrrigationRecord(field_id=field_b.id, amount=40.0, unit="mm", method="Sprinkler", notes="Evening sprinkler application", date=base_time - datetime.timedelta(days=5))
    ]
    db.add_all(irrigations)

    # 7. Weather Records
    weather_records = [
        WeatherRecord(field_id=field_a.id, temperature=31.2, humidity=72.0, rainfall=2.5, rain_probability=82.0, wind_speed=14.5, recorded_at=base_time),
        WeatherRecord(field_id=field_b.id, temperature=31.5, humidity=70.0, rainfall=1.0, rain_probability=80.0, wind_speed=15.0, recorded_at=base_time),
        WeatherRecord(field_id=field_c.id, temperature=28.0, humidity=85.0, rainfall=12.0, rain_probability=90.0, wind_speed=18.0, recorded_at=base_time)
    ]
    db.add_all(weather_records)

    # 8. AI Recommendations
    rec1 = AIRecommendation(
        field_id=field_a.id,
        type="Irrigation",
        recommendation="Delay irrigation by 24 hours.",
        reason="Current soil moisture is sufficient (71%) and rainfall is expected tomorrow (82% probability).",
        confidence="HIGH",
        evidence=["Soil moisture: 71%", "Rain probability: 82%", "Crop stage: Flowering"],
        data_used=["Field A Soil Sensor", "Open-Meteo Ahmedabad Forecast", "GW-322 Phenology"],
        next_action="Recheck soil moisture tomorrow after rainfall.",
        warnings=["Avoid saturated root zone during flowering stage."],
        language="en",
        created_at=base_time - datetime.timedelta(hours=3)
    )
    rec2 = AIRecommendation(
        field_id=field_b.id,
        type="Nutrient",
        recommendation="Apply foliar magnesium and zinc supplement.",
        reason="Slight interveinal chlorosis observed during rapid vegetative growth phase.",
        confidence="MEDIUM",
        evidence=["Soil moisture: 55%", "Soil pH: 7.2"],
        data_used=["Soil Test Record", "Cotton vegetative guidelines"],
        next_action="Spray 0.5% ZnSO4 + 1% MgSO4 during early morning.",
        warnings=[],
        language="en",
        created_at=base_time - datetime.timedelta(days=2)
    )
    db.add_all([rec1, rec2])

    # 9. Crop Image & Analysis
    sample_image = CropImage(
        user_id=farmer.id,
        field_id=field_a.id,
        crop_id=crop1.id,
        image_url="/uploads/wheat_leaf_sample.jpg",
        status="ANALYZED"
    )
    db.add(sample_image)
    db.commit()

    sample_analysis = ImageAnalysis(
        image_id=sample_image.id,
        visual_observations=[
            "Yellowing leaves with localized chlorosis",
            "Brown necrotic spots along lower leaves",
            "Mild leaf tip wilting"
        ],
        possible_causes=[
            "Water stress combined with temporary root hypoxia",
            "Potential early nitrogen deficiency",
            "Possible early stage fungal infection (Yellow Rust vector)"
        ],
        severity="MODERATE",
        confidence="MEDIUM",
        recommendation="Verify field drainage, withhold irrigation until soil dries slightly, and observe if yellow pustules appear.",
        evidence=["GW-322 Wheat crop", "71% soil moisture reading", "High ambient humidity (72%)"],
        additional_information_needed=["Fertilizer application history for the last 14 days"],
        language="en"
    )
    db.add(sample_analysis)

    # 10. Knowledge Documents
    docs = [
        KnowledgeDocument(title="ICAR Wheat Cultivation & Water Management", description="Standard agronomic guidelines for high-yielding wheat varieties", source="ICAR New Delhi", document_type="PDF", crop="Wheat", region="Pan-India", language="en", status="INDEXED", chunk_count=8),
        KnowledgeDocument(title="IRRI Alternate Wetting and Drying (AWD) in Paddy", description="Water-saving water regimes for irrigated lowland rice", source="IRRI / CRRI", document_type="PDF", crop="Rice", region="Pan-India", language="en", status="INDEXED", chunk_count=6),
        KnowledgeDocument(title="Cotton Pest & Disease Management Protocols", description="Identification and management of whitefly, bollworms, and leaf curl virus", source="CICR Nagpur", document_type="PDF", crop="Cotton", region="Gujarat & Maharashtra", language="en", status="INDEXED", chunk_count=10),
        KnowledgeDocument(title="Saurashtra Groundnut Agronomy & Gypsum Management", description="Calcium nutrition and irrigation scheduling during pegging", source="DGR Junagadh", document_type="PDF", crop="Groundnut", region="Gujarat", language="en", status="INDEXED", chunk_count=5),
        KnowledgeDocument(title="Tomato Blight & Blossom End Rot Guidelines", description="Fungal blight mitigation and drip fertigation practices", source="IIHR Bengaluru", document_type="PDF", crop="Tomato", region="Pan-India", language="en", status="INDEXED", chunk_count=7),
        KnowledgeDocument(title="गेहूं सिंचाई एवं उर्वरक प्रबंधन मार्गदर्शिका", description="भारतीय कृषि अनुसंधान परिषद द्वारा गेहूं उत्पादन हेतु तकनीकी दिशा-निर्देश", source="ICAR", document_type="PDF", crop="Wheat", region="उत्तर भारत", language="hi", status="INDEXED", chunk_count=6),
        KnowledgeDocument(title="ગુજરાતમાં ઘઉં અને કપાસની વૈજ્ઞાનિક ખેતી પદ્ધતિ", description="ગુજરાત કૃષિ યુનિવર્સિટી દ્વારા ભલામણ કરેલ પિયત અને ખાતર વ્યવસ્થાપન", source="GAU Anand", document_type="PDF", crop="Wheat", region="Gujarat", language="gu", status="INDEXED", chunk_count=5)
    ]
    db.add_all(docs)

    # 11. Notifications
    notifs = [
        Notification(
            user_id=farmer.id,
            type="weather_alert",
            title="Heavy Rainfall Expected Tomorrow",
            message="Weather forecast indicates an 82% probability of rain (12-18mm). Irrigation should be delayed.",
            language="en",
            is_read=False
        ),
        Notification(
            user_id=farmer.id,
            type="irrigation_rec",
            title="AI Irrigation Alert for Field A",
            message="AI Advisor recommends postponing irrigation by 24 hours to prevent waterlogging.",
            language="en",
            is_read=False
        ),
        Notification(
            user_id=advisor.id,
            type="system",
            title="Farmer Ramesh Patel Assigned",
            message="You have been assigned as the agricultural advisor for farmer Ramesh Patel (Ahmedabad Farm).",
            language="en",
            is_read=False
        )
    ]
    db.add_all(notifs)

    # 12. Advisor Assignment
    from app.models.models import AdvisorAssignment, CropType, AuditLog
    assignment = AdvisorAssignment(
        advisor_id=advisor.id,
        farmer_id=farmer.id,
        farm_id=farm1.id,
        field_id=field_a.id,
        notes="Primary agronomic advisor for wheat and kharif cycles"
    )
    db.add(assignment)

    # 13. Crop Types Catalog
    crop_types = [
        CropType(name="Wheat", scientific_name="Triticum aestivum", category="Cereal", varieties=["GW-496", "GW-322", "Lok-1", "HD-2967", "Sharbati"], growth_stages=["CRI", "Tillering", "Booting", "Flowering", "Milking", "Maturity"], water_requirement_mm=450),
        CropType(name="Rice", scientific_name="Oryza sativa", category="Cereal", varieties=["Basmati 1121", "IR-64", "Sona Masoori", "Gurjari"], growth_stages=["Nursery", "Tillering", "Panicle Initiation", "Flowering", "Harvest"], water_requirement_mm=1200),
        CropType(name="Cotton", scientific_name="Gossypium hirsutum", category="Fiber", varieties=["Bt Cotton RCH-2", "G.Cot.20", "DCH-32"], growth_stages=["Emergence", "Squaring", "Flowering", "Boll Formation", "Boll Opening"], water_requirement_mm=700),
        CropType(name="Groundnut", scientific_name="Arachis hypogaea", category="Oilseeds", varieties=["GG-20", "TG-37A", "Kadiri-6"], growth_stages=["Vegetative", "Flowering", "Pegging", "Pod Development", "Maturity"], water_requirement_mm=500),
        CropType(name="Tomato", scientific_name="Solanum lycopersicum", category="Vegetable", varieties=["Abhinav", "Pusa Ruby", "Arka Rakshak"], growth_stages=["Seedling", "Vegetative", "Flowering", "Fruit Setting", "Ripening"], water_requirement_mm=600)
    ]
    db.add_all(crop_types)

    # 14. Initial Audit Logs
    audit_events = [
        AuditLog(user_id=admin.id, action="USER_CREATED", resource_type="User", resource_id=farmer.id, details={"name": farmer.name, "role": farmer.role}),
        AuditLog(user_id=admin.id, action="ADVISOR_ASSIGNED", resource_type="AdvisorAssignment", resource_id=advisor.id, details={"advisor": advisor.email, "farmer": farmer.email}),
        AuditLog(user_id=farmer.id, action="FARM_CREATED", resource_type="Farm", resource_id=farm1.id, details={"farm_name": farm1.name}),
        AuditLog(user_id=farmer.id, action="FIELD_CREATED", resource_type="Field", resource_id=field_a.id, details={"field_name": field_a.name})
    ]
    db.add_all(audit_events)

    db.commit()

